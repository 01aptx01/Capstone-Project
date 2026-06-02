# server/tests/test_members_api.py
import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Ensure server/ directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, g
from app.api.members import members_api

class TestMembersAPI(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(members_api)
        self.client = self.app.test_client()
        self.app.testing = True

    @patch("app.api.members.get_db_cursor")
    @patch("app.auth.member_auth.get_bearer_phone")
    def test_register_member_success(self, mock_get_bearer_phone, mock_get_db):
        """Test successfully registering a new member."""
        mock_get_bearer_phone.return_value = "0812345678"
        
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        
        # Simulate DB SELECT returning None (user does not exist)
        mock_cur.fetchone.return_value = None
        # Simulate INSERT assigning ID 10
        mock_cur.lastrowid = 10
        
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        # We must set Authorization header to pass member_required, although we mocked get_bearer_phone
        response = self.client.post(
            "/api/members/register",
            json={"display_name": "Test User"},
            headers={"Authorization": "Bearer fake_token"}
        )

        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["user_id"], 10)
        self.assertEqual(data["phone_number"], "0812345678")
        self.assertEqual(data["display_name"], "Test User")
        self.assertEqual(data["points"], 0)
        
        mock_conn.commit.assert_called_once()

    @patch("app.api.members.get_db_cursor")
    @patch("app.auth.member_auth.get_bearer_phone")
    def test_register_member_already_exists(self, mock_get_bearer_phone, mock_get_db):
        """Test registering a member that already exists."""
        mock_get_bearer_phone.return_value = "0812345678"
        
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        
        # Simulate DB SELECT returning an existing row
        mock_cur.fetchone.return_value = {"user_id": 10}
        
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        response = self.client.post(
            "/api/members/register",
            json={"display_name": "Test User"},
            headers={"Authorization": "Bearer fake_token"}
        )

        self.assertEqual(response.status_code, 409)
        data = response.get_json()
        self.assertEqual(data["error"], "already_exists")
        
    @patch("app.api.members.get_db_cursor")
    def test_get_member_success(self, mock_get_db):
        """Test fetching a member successfully."""
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        
        mock_cur.fetchone.return_value = {
            "user_id": 10,
            "phone_number": "0812345678",
            "display_name": "Test User",
            "points": 100,
            "registered_at": "2023-01-01 10:00:00",
            "last_use": "2023-01-02 10:00:00",
            "status": "active"
        }
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        response = self.client.get("/api/members/0812345678")
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data["found"])
        self.assertEqual(data["user_id"], 10)
        self.assertEqual(data["display_name"], "Test User")
        self.assertEqual(data["points"], 100)

    @patch("app.api.members.get_db_cursor")
    def test_get_member_not_found(self, mock_get_db):
        """Test fetching a member that does not exist."""
        mock_conn = MagicMock()
        mock_cur = MagicMock()
        
        mock_cur.fetchone.return_value = None
        mock_get_db.return_value.__enter__.return_value = (mock_conn, mock_cur)

        response = self.client.get("/api/members/0812345678")
        
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertFalse(data["found"])

if __name__ == "__main__":
    unittest.main()
