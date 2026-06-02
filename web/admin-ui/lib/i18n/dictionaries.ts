export type Lang = "th" | "en";

export type DictKey =
  | "nav.dashboard"
  | "nav.products"
  | "nav.machines"
  | "nav.orders"
  | "nav.customersCoupons"
  | "nav.settings"
  | "nav.logout"
  | "header.notifications"
  | "header.notificationsMarkAllRead"
  | "header.notificationsEmpty"
  | "header.notificationsViewAll"
  | "header.profile"
  | "header.settings"
  | "header.logout"
  | "header.searchPlaceholder"
  | "header.palette.hint"
  | "header.palette.searching"
  | "header.palette.noResults"
  | "header.palette.menu"
  | "header.palette.products"
  | "header.palette.machines"
  | "header.palette.customers"
  | "header.palette.orders"
  | "settings.title"
  | "settings.subtitle"
  | "settings.tabs.general"
  | "settings.tabs.security"
  | "settings.tabs.admin"
  | "settings.displayTitle"
  | "settings.darkModeTitle"
  | "settings.darkModeDesc"
  | "settings.languageTitle"
  | "settings.languageDesc"
  | "common.refresh"
  | "common.export"
  | "common.exportReport"
  | "common.exportData"
  | "common.loading"
  | "common.loadingDots"
  | "page.dashboard.title"
  | "page.dashboard.subtitle"
  | "page.dashboard.loading"
  | "page.dashboard.errorLoad"
  | "page.dashboard.exportModalTitle"
  | "page.dashboard.card.salesToday"
  | "page.dashboard.card.ordersToday"
  | "page.dashboard.card.machinesReady"
  | "page.dashboard.card.lowStock"
  | "page.dashboard.export.overview"
  | "page.dashboard.export.overviewDesc"
  | "page.dashboard.export.salesSeries"
  | "page.dashboard.export.salesSeriesDesc"
  | "page.dashboard.export.topProducts"
  | "page.dashboard.export.topProductsDesc"
  | "page.dashboard.export.col.topic"
  | "page.dashboard.export.col.value"
  | "page.dashboard.export.col.date"
  | "page.dashboard.export.col.revenue"
  | "page.dashboard.export.col.orders"
  | "page.dashboard.export.col.rank"
  | "page.dashboard.export.col.name"
  | "page.customers.title"
  | "page.customers.subtitle"
  | "page.customers.export"
  | "page.customers.exportTitle"
  | "page.customers.createCoupon"
  | "page.customers.report.memberTotal"
  | "page.customers.report.points"
  | "page.customers.report.couponUsedMonth"
  | "page.customers.report.couponUsedMonthSub"
  | "page.customers.report.couponAvailable"
  | "page.customers.report.items"
  | "page.customers.report.sub.people"
  | "page.customers.report.sub.pointsFromLoaded"
  | "page.customers.report.sub.notInApi"
  | "page.customers.export.metricsTitle"
  | "page.customers.export.metricsDesc"
  | "page.customers.export.couponsTitle"
  | "page.customers.export.couponsDesc"
  | "page.products.title"
  | "page.products.subtitle"
  | "page.products.exportReport"
  | "page.products.exportTitle"
  | "page.products.addProduct"
  | "page.products.filterTitle"
  | "page.products.categoryLabel"
  | "page.products.machineLabel"
  | "page.products.stockStatusLabel"
  | "page.products.clearFilters"
  | "page.products.allCategories"
  | "page.products.allMachines"
  | "page.products.allStatuses"
  | "page.machines.title"
  | "page.machines.subtitle"
  | "page.machines.export"
  | "page.machines.exportTitle"
  | "page.machines.stat.total"
  | "page.machines.stat.online"
  | "page.machines.stat.socket"
  | "page.machines.stat.alerts"
  | "page.machines.listTitle"
  | "page.machines.addMachine"
  | "page.machines.emptyTitle"
  | "page.machines.emptyHint"
  | "page.machines.addTileTitle"
  | "page.machines.addTileHint"
  | "page.orders.title"
  | "page.orders.subtitle"
  | "page.orders.export"
  | "page.orders.exportTitle"
  | "page.orders.card.total"
  | "page.orders.card.pending"
  | "page.orders.card.completed"
  | "page.orders.card.revenue"
  | "page.orders.tableTitle"
  | "page.orders.col.orderId"
  | "page.orders.col.time"
  | "page.orders.col.machine"
  | "page.orders.col.customer"
  | "page.orders.col.payment"
  | "page.orders.col.items"
  | "page.orders.col.total"
  | "page.orders.col.status"
  | "page.orders.empty"
  | "page.orders.emptyHint"
  | "page.orders.footer"
  | "page.orders.badge.completed"
  | "page.orders.badge.refunded"
  | "page.orders.export.summaryLabel"
  | "page.orders.export.summaryDesc"
  | "page.orders.export.col.metric"
  | "page.orders.export.col.value"
  | "page.orders.export.metric.totalApi"
  | "page.orders.export.metric.pendingCancelled"
  | "page.orders.export.metric.completed"
  | "page.orders.export.metric.revenueApprox"
  | "page.orders.export.listLabel"
  | "page.orders.export.listDesc"
  | "page.alerts.title"
  | "page.alerts.subtitle"
  | "page.alerts.includeResolved"
  | "page.alerts.export"
  | "page.alerts.exportTitle"
  | "page.alerts.sectionErrors"
  | "page.alerts.sectionLowStock"
  | "page.alerts.loading"
  | "page.alerts.empty"
  | "page.alerts.emptyLow"
  | "page.alerts.resolve"
  | "page.alerts.resolving"
  | "page.alerts.badgeResolved"
  | "page.alerts.lowStockTitle"
  | "page.alerts.remain"
  | "page.alerts.slotLine"
  | "page.alerts.machinePrefix"
  | "page.alerts.sectionChanges"
  | "page.alerts.emptyChanges"
  | "page.alerts.changeBy"
  | "page.alerts.action.updated_slots"
  | "page.alerts.action.updated_metadata"
  | "page.alerts.action.unknown"
  | "alerts.toast.resolved"
  | "coupon.tab.all"
  | "coupon.tab.active"
  | "coupon.tab.expired"
  | "coupon.title"
  | "coupon.apiNote"
  | "coupon.createNew"
  | "coupon.searchPlaceholder"
  | "coupon.refresh"
  | "coupon.col.coupon"
  | "coupon.col.type"
  | "coupon.col.discount"
  | "coupon.col.points"
  | "coupon.col.utilization"
  | "coupon.col.expiry"
  | "coupon.col.actions"
  | "coupon.loading"
  | "coupon.empty"
  | "coupon.footer"
  | "coupon.redeemed"
  | "coupon.usageNotInApi"
  | "coupon.redemptionsOpen"
  | "coupon.redemptionsTitle"
  | "coupon.redemptionsSubtitle"
  | "coupon.redemptionsEmpty"
  | "coupon.redemptionsClose"
  | "coupon.redemptionsColUser"
  | "coupon.redemptionsColOrder"
  | "coupon.redemptionsColDate"
  | "coupon.redemptionsColAmount"
  | "coupon.redemptionsColStatus"
  | "coupon.edit"
  | "coupon.editTitle"
  | "coupon.editSubtitle"
  | "coupon.label.code"
  | "coupon.label.type"
  | "coupon.label.discountAmount"
  | "coupon.label.discountPercent"
  | "coupon.label.points"
  | "coupon.label.expiry"
  | "coupon.hint.expiryBangkok"
  | "coupon.label.active"
  | "coupon.option.fixed"
  | "coupon.option.percent"
  | "coupon.cancel"
  | "coupon.save"
  | "coupon.saving"
  | "coupon.pointsSuffix"
  | "coupon.filter.title"
  | "coupon.filter.status"
  | "coupon.filter.couponType"
  | "coupon.filter.expiryDate"
  | "coupon.filter.reset"
  | "coupon.filter.apply"
  | "coupon.filter.aria"
  | "coupon.filter.opt.allStatus"
  | "coupon.filter.opt.active"
  | "coupon.filter.opt.inactive"
  | "coupon.filter.opt.expired"
  | "coupon.filter.opt.allTypes"
  | "coupon.filter.opt.percent"
  | "coupon.filter.opt.fixed"
  | "coupon.error.loadFailed"
  | "coupon.error.codeRequired"
  | "coupon.error.discountInvalid"
  | "coupon.error.pointsInvalid"
  | "coupon.error.saveFailed"
  | "coupon.capLabel"
  | "coupon.status.active"
  | "coupon.status.inactive"
  | "coupon.status.expired"
  | "machine.detail.errorLoad"
  | "machine.detail.toastRefreshed"
  | "machine.detail.toastRefreshFail"
  | "machine.detail.stat.slots"
  | "machine.detail.stat.qty"
  | "machine.detail.stat.socket"
  | "machine.detail.socketOn"
  | "machine.detail.socketOff"
  | "machine.detail.stat.dbUpdated"
  | "machine.detail.stat.status"
  | "machine.detail.toastSaved"
  | "machine.detail.toastSaveFail"
  | "machine.detail.errorDuplicateSlot"
  | "machine.detail.locationUnknown"
  | "machine.detail.refreshing"
  | "machine.detail.refresh"
  | "machine.detail.stockBySlot"
  | "machine.detail.cancelEdit"
  | "machine.detail.saveStock"
  | "machine.detail.saving"
  | "machine.detail.loadingProducts"
  | "machine.detail.noProducts"
  | "machine.detail.col.slot"
  | "machine.detail.col.product"
  | "machine.detail.col.qty"
  | "machine.detail.col.price"
  | "machine.detail.notInList"
  | "machine.detail.removeSlot"
  | "machine.detail.saveHint"
  | "machine.detail.slotEmpty"
  | "machine.detail.slotActivate"
  | "machine.detail.errorDuplicateProduct"
  | "page.alerts.export.errorsIncl"
  | "page.alerts.export.errorsOnly"
  | "page.alerts.export.lowThreshold"
  | "page.alerts.export.col.eventType"
  | "page.alerts.export.col.state"
  | "page.alerts.export.col.resolved"
  | "page.alerts.machineLabel"
  | "page.alerts.slotLabel"
  | "page.sales.title"
  | "page.sales.subtitle"
  | "page.sales.export"
  | "page.sales.exportTitle"
  | "page.sales.card.today"
  | "page.sales.card.yesterday"
  | "page.sales.card.avgOrder"
  | "page.sales.tableTitle"
  | "page.sales.allLocations"
  | "page.sales.col.transactionId"
  | "page.sales.col.time"
  | "page.sales.col.machine"
  | "page.sales.col.amount"
  | "page.sales.col.status"
  | "page.sales.col.details"
  | "page.reports.title"
  | "page.reports.subtitle"
  | "page.reports.export"
  | "page.reports.exportTitle"
  | "page.reports.card.totalSales"
  | "page.reports.card.totalSalesSub"
  | "page.reports.card.avgMachine"
  | "page.reports.card.avgMachineSub"
  | "page.reports.card.totalOrders"
  | "page.reports.card.ordersSub"
  | "page.reports.card.issues"
  | "page.reports.card.issuesSub"
  | "profile.joinedPrefix"
  | "profile.editProfile"
  | "profile.cancel"
  | "profile.save"
  | "profile.accountTitle"
  | "profile.label.name"
  | "profile.label.firstName"
  | "profile.label.lastName"
  | "profile.label.role"
  | "profile.label.systemRole"
  | "profile.label.email"
  | "profile.label.phone"
  | "profile.label.bio"
  | "profile.loading"
  | "profile.loadError"
  | "profile.saving"
  | "profile.saveSuccess"
  | "profile.saveFailed"
  | "profile.emailReadonly"
  | "profile.positionPlaceholder"
  | "profile.activityEmpty"
  | "profile.recentActivity"
  | "profile.viewAll"
  | "profile.completionHint"
  | "profile.stat.machines"
  | "profile.stat.rating"
  | "profile.stat.totalSales"
  | "common.cancel"
  | "common.save"
  | "common.confirm"
  | "common.actions"
  | "common.email"
  | "common.status"
  | "logout.title"
  | "logout.subtitle"
  | "alerts.toast.machineErrorTitle"
  | "alerts.toast.openAlerts"
  | "page.dashboard.export.metric.salesToday"
  | "page.dashboard.export.metric.ordersToday"
  | "page.dashboard.export.metric.machinesOnline"
  | "page.dashboard.export.metric.lowStock"
  | "page.customers.error.loadFailed"
  | "page.customers.export.metric.totalMembers"
  | "page.customers.export.metric.totalPoints"
  | "page.customers.export.metric.activeCoupons"
  | "page.customers.export.metric.couponsUsedMonth"
  | "page.customers.export.units.people"
  | "page.customers.export.units.items"
  | "page.customers.export.units.notInApi"
  | "page.customers.export.col.couponId"
  | "page.customers.export.col.couponName"
  | "page.customers.export.col.couponType"
  | "page.customers.export.col.couponPoints"
  | "page.customers.export.col.couponUsage"
  | "page.customers.export.col.couponMaxUsage"
  | "page.customers.export.col.couponExpiry"
  | "page.customers.export.col.couponStatus"
  | "page.products.export.desc"
  | "page.products.export.col.code"
  | "page.products.export.col.name"
  | "page.products.export.col.category"
  | "page.products.export.col.machines"
  | "page.products.export.col.qty"
  | "page.products.export.col.price"
  | "page.products.export.col.status"
  | "page.machines.error.loadFailed"
  | "page.machines.export.desc"
  | "page.machines.export.col.id"
  | "page.machines.export.col.name"
  | "page.machines.export.col.location"
  | "page.machines.export.col.status"
  | "customer.table.title"
  | "customer.table.apiNote"
  | "customer.table.col.phone"
  | "customer.table.col.points"
  | "customer.table.col.status"
  | "customer.table.col.registered"
  | "customer.table.col.lastUse"
  | "customer.table.empty"
  | "customer.table.footer"
  | "product.table.col.info"
  | "product.table.col.category"
  | "product.table.col.machines"
  | "product.table.col.qty"
  | "product.table.col.price"
  | "product.table.col.status"
  | "product.table.col.actions"
  | "product.table.empty"
  | "product.table.installPoint"
  | "product.table.unit"
  | "product.table.titleEdit"
  | "product.table.titleHistory"
  | "product.table.footer"
  | "product.refresh"
  | "machine.card.statusOnline"
  | "machine.card.statusMaintenance"
  | "machine.card.statusOffline"
  | "machine.card.opStatusTitle"
  | "machine.card.socketTitle"
  | "machine.card.socketOn"
  | "machine.card.socketOff"
  | "addMachine.errorRequired"
  | "addMachine.errorCodeMaxLength"
  | "addMachine.errorFailed"
  | "addMachine.modalTitleNew"
  | "addMachine.modalTitleSuccess"
  | "addMachine.success.savedTag"
  | "addMachine.success.headline"
  | "addMachine.success.tokenWarning"
  | "addMachine.success.done"
  | "addMachine.upload.placeholder"
  | "addMachine.uiNote"
  | "addMachine.label.machineId"
  | "addMachine.placeholder.machineId"
  | "addMachine.label.location"
  | "addMachine.placeholder.location"
  | "addMachine.label.status"
  | "addMachine.label.machineType"
  | "addMachine.option.cool"
  | "addMachine.option.hot"
  | "addMachine.option.snack"
  | "addMachine.creating"
  | "addMachine.confirm"
  | "editMachine.title"
  | "editMachine.note"
  | "editMachine.label.machineId"
  | "editMachine.label.location"
  | "editMachine.placeholder.location"
  | "editMachine.label.status"
  | "editMachine.option.online"
  | "editMachine.option.maintenance"
  | "editMachine.option.offline"
  | "editMachine.errorNotFound"
  | "editMachine.toastSaved"
  | "editMachine.toastFailed"
  | "editMachine.saving"
  | "editMachine.save"
  | "addProduct.title"
  | "addProduct.errorInvalid"
  | "addProduct.errorPriceMin"
  | "addProduct.toastCreated"
  | "addProduct.label.name"
  | "addProduct.placeholder.name"
  | "addProduct.label.imageUrl"
  | "addProduct.placeholder.imageUrl"
  | "addProduct.label.category"
  | "addProduct.label.unitPrice"
  | "addProduct.label.heatingTime"
  | "addProduct.hint.heatingTime"
  | "addProduct.errorHeatingTime"
  | "addProduct.label.description"
  | "addProduct.placeholder.description"
  | "addProduct.note"
  | "addProduct.creating"
  | "addProduct.confirm"
  | "productImage.upload"
  | "productImage.uploading"
  | "productImage.previewAlt"
  | "productImage.invalidUrl"
  | "productImage.uploadFailed"
  | "productImage.uploadSuccess"
  | "editProduct.title"
  | "editProduct.errorNotFound"
  | "editProduct.toastSaved"
  | "editProduct.idLabel"
  | "editProduct.saving"
  | "editProduct.save"
  | "createCoupon.headline"
  | "createCoupon.subtitle"
  | "createCoupon.errorRequired"
  | "createCoupon.errorDiscount"
  | "createCoupon.errorPercentMax"
  | "createCoupon.errorPoints"
  | "createCoupon.errorFailed"
  | "createCoupon.placeholder.code"
  | "createCoupon.placeholder.points"
  | "createCoupon.label.validTo"
  | "createCoupon.label.maxUses"
  | "createCoupon.label.activate"
  | "createCoupon.placeholder.maxUses"
  | "createCoupon.hint.maxUses"
  | "createCoupon.errorMaxUses"
  | "createCoupon.creating"
  | "manageStock.title"
  | "manageStock.subtitle"
  | "manageStock.addProduct"
  | "manageStock.addModalTitle"
  | "manageStock.addModalSubtitle"
  | "manageStock.searchPlaceholder"
  | "manageStock.empty"
  | "manageStock.initialQty"
  | "manageStock.confirmAdd"
  | "manageStock.table.col.edit"
  | "manageStock.table.col.productName"
  | "manageStock.table.col.quantity"
  | "manageStock.table.col.status"
  | "manageStock.status.out"
  | "manageStock.status.low"
  | "manageStock.status.in"
  | "manageStock.cancel"
  | "manageStock.saveChanges"
  | "manageStock.confirm.saveTitle"
  | "manageStock.confirm.discardTitle"
  | "manageStock.confirm.saveBody"
  | "manageStock.confirm.discardBody"
  | "manageStock.confirm.noGoBack"
  | "manageStock.confirm.yesSave"
  | "manageStock.confirm.yesDiscard"
  | "exportModal.title"
  | "exportModal.step1"
  | "exportModal.step2"
  | "exportModal.selectAll"
  | "exportModal.clearAll"
  | "exportModal.selectAtLeast"
  | "exportModal.noCsvData"
  | "exportModal.exporting"
  | "exportModal.download"
  | "settings.notif.title"
  | "settings.notif.lowStockTitle"
  | "settings.notif.lowStockDesc"
  | "settings.notif.systemTitle"
  | "settings.notif.systemDesc"
  | "settings.password.title"
  | "settings.password.current"
  | "settings.password.new"
  | "settings.password.confirm"
  | "settings.password.submit"
  | "settings.password.submitting"
  | "settings.password.hintMinLength"
  | "settings.password.success"
  | "settings.password.errorMismatch"
  | "settings.password.errorMinLength"
  | "settings.password.errorFailed"
  | "settings.phone.title"
  | "settings.phone.successTitle"
  | "settings.phone.newLabel"
  | "settings.phone.currentLabel"
  | "settings.phone.newField"
  | "settings.phone.placeholder"
  | "settings.phone.sendOtp"
  | "settings.phone.otpHint"
  | "settings.phone.otpLabel"
  | "settings.phone.confirmOtp"
  | "settings.admin.deniedTitle"
  | "settings.admin.deniedDesc"
  | "settings.admin.inviteTitle"
  | "settings.admin.inviteDesc"
  | "settings.admin.tempPasswordLabel"
  | "settings.admin.tempPasswordPlaceholder"
  | "settings.admin.sendInvite"
  | "settings.admin.listTitle"
  | "settings.admin.empty"
  | "settings.admin.revoke"
  | "settings.admin.revokeTitle"
  | "settings.admin.revokeWarn"
  | "settings.admin.revokeConfirmText"
  | "settings.admin.revokeYes"
  | "security.title"
  | "security.subtitle"
  | "security.changePassword"
  | "security.changePasswordDesc"
  | "security.update"
  | "security.twoFA"
  | "security.twoFADesc"
  | "security.twoFAOn"
  | "security.twoFAOff"
  | "security.twoFANote"
  | "security.twoFAConfigure"
  | "security.twoFASetup"
  | "security.sessions"
  | "security.sessionsDesc"
  | "security.sessionCurrent"
  | "security.sessionLogoutOthers"
  | "datePicker.label"
  | "datePicker.title"
  | "datePicker.from"
  | "datePicker.to"
  | "datePicker.through"
  | "datePicker.clear"
  | "datePicker.apply"
  | "chart.loading"
  | "chart.empty"
  | "chart.title"
  | "chart.machineTitle"
  | "chart.dashboardTitle"
  | "chart.subtitle"
  | "chart.rangeLabel"
  | "chart.revenue"
  | "chart.ordersUnit"
  | "page.sales.badge.paid"
  | "page.sales.badge.processing"
  | "page.sales.badge.failed"
  | "page.sales.pagination"
  | "page.sales.previous"
  | "page.sales.next"
  | "profile.activity.refill"
  | "profile.activity.firmware"
  | "profile.activity.cashCheck"
  | "profile.activity.minutesAgo"
  | "profile.activity.hoursAgo"
  | "profile.activity.yesterdayAt"
  | "security.session.location"
  | "security.session.activeNow"
  | "security.session.logoutDevice"
  | "salesByLocation.title"
  | "salesByLocation.subtitle"
  | "salesByLocation.contribution"
  | "salesByLocation.loc1"
  | "salesByLocation.loc2"
  | "salesByLocation.loc3"
  | "salesByLocation.loc4"
  | "salesByFlavor.title"
  | "salesByFlavor.subtitle"
  | "salesByFlavor.f1"
  | "salesByFlavor.f2"
  | "salesByFlavor.f3"
  | "salesByFlavor.f4"
  | "salesByFlavor.f5"
  | "salesByFlavor.f6"
  | "page.orders.itemsLabel"
  | "deleteMachine.button"
  | "deleteMachine.confirmTitle"
  | "deleteMachine.confirmBody"
  | "deleteMachine.confirmYes"
  | "deleteMachine.deleting"
  | "deleteMachine.toastDeleted"
  | "deleteMachine.toastFailed"
  | "deleteCoupon.button"
  | "deleteCoupon.confirmTitle"
  | "deleteCoupon.confirmBody"
  | "deleteCoupon.confirmYes"
  | "deleteCoupon.deleting"
  | "deleteCoupon.toastDeleted"
  | "deleteCoupon.toastFailed"
  | "deleteProduct.button"
  | "deleteProduct.confirmTitle"
  | "deleteProduct.confirmBody"
  | "deleteProduct.confirmYes"
  | "deleteProduct.deleting"
  | "deleteProduct.toastDeleted"
  | "deleteProduct.toastFailed"

type Dict = Record<DictKey, string>;

export const DICTS: Record<Lang, Dict> = {
  th: {
    "nav.dashboard": "แดชบอร์ด",
    "nav.products": "คลังสินค้า",
    "nav.machines": "จัดการตู้",
    "nav.orders": "คำสั่งซื้อ",
    "nav.customersCoupons": "ลูกค้า & คูปอง",
    "nav.settings": "ตั้งค่า",
    "nav.logout": "ออกจากระบบ",
    "header.notifications": "การแจ้งเตือน",
    "header.notificationsMarkAllRead": "อ่านทั้งหมด",
    "header.notificationsEmpty": "ไม่มีการแจ้งเตือนใหม่",
    "header.notificationsViewAll": "ดูทั้งหมด",
    "header.profile": "โปรไฟล์",
    "header.settings": "ตั้งค่า",
    "header.logout": "ออกจากระบบ",
    "header.searchPlaceholder": "ค้นหาตู้ สินค้า ลูกค้า ออเดอร์ หรือเมนู…",
    "header.palette.hint": "พิมพ์เพื่อค้นหาข้ามสินค้า ตู้ ลูกค้า และออเดอร์ หรือเลือกทางลัดด้านล่าง",
    "header.palette.searching": "กำลังค้นหา…",
    "header.palette.noResults": "ไม่พบผลลัพธ์ในฐานข้อมูลสำหรับ",
    "header.palette.menu": "เมนู",
    "header.palette.products": "สินค้า",
    "header.palette.machines": "ตู้",
    "header.palette.customers": "ลูกค้า",
    "header.palette.orders": "ออเดอร์",
    "settings.title": "ตั้งค่าระบบ (Settings)",
    "settings.subtitle": "ปรับแต่งการใช้งาน ความปลอดภัย และจัดการสิทธิ์ผู้ดูแลระบบ",
    "settings.tabs.general": "General Settings",
    "settings.tabs.security": "Security Settings",
    "settings.tabs.admin": "Admin Permissions",
    "settings.displayTitle": "การแสดงผล (Display)",
    "settings.darkModeTitle": "โหมดมืด (Dark Mode)",
    "settings.darkModeDesc": "ปรับเปลี่ยนโทนสีของระบบให้เป็นสีเข้ม",
    "settings.languageTitle": "ภาษา (Language)",
    "settings.languageDesc": "เลือกภาษาที่ต้องการใช้งานในระบบ",
    "common.refresh": "รีเฟรช",
    "common.export": "Export",
    "common.exportReport": "Export รายงาน",
    "common.exportData": "Export ข้อมูล",
    "common.loading": "กำลังโหลด…",
    "common.loadingDots": "กำลังโหลด…",
    "page.dashboard.title": "แดชบอร์ดภาพรวม",
    "page.dashboard.subtitle":
      "ภาพรวมข้อมูลการทำงานของตู้ทั้งหมด รายงานและสถิติวิเคราะห์ประสิทธิภาพการทำงานและแนวโน้มยอดขายเชิงลึก",
    "page.dashboard.loading": "กำลังโหลดข้อมูลแดชบอร์ด…",
    "page.dashboard.errorLoad": "โหลดแดชบอร์ดไม่สำเร็จ",
    "page.dashboard.exportModalTitle": "ภาพรวม Dashboard",
    "page.dashboard.card.salesToday": "ยอดขายวันนี้",
    "page.dashboard.card.ordersToday": "จำนวนคำสั่งซื้อ (วันนี้)",
    "page.dashboard.card.machinesReady": "ตู้ที่พร้อมใช้งาน",
    "page.dashboard.card.lowStock": "แจ้งเตือนสต็อกต่ำ",
    "page.dashboard.export.overview": "ข้อมูลภาพรวม (Overview Stats)",
    "page.dashboard.export.overviewDesc": "ยอดขายรวม, จำนวนคำสั่งซื้อ, และตู้ที่พร้อมใช้งาน",
    "page.dashboard.export.salesSeries": "ยอดขายรายวัน (Sales series)",
    "page.dashboard.export.salesSeriesDesc":
      "ช่วง {days} วันล่าสุดจาก /api/admin/reports/sales",
    "page.dashboard.export.topProducts": "สินค้าขายดี (จาก summary)",
    "page.dashboard.export.topProductsDesc": "Top จาก /api/admin/dashboard/summary",
    "page.dashboard.export.col.topic": "หัวข้อ",
    "page.dashboard.export.col.value": "ค่าที่ได้",
    "page.dashboard.export.col.date": "วันที่",
    "page.dashboard.export.col.revenue": "รายได้ (฿)",
    "page.dashboard.export.col.orders": "ออเดอร์",
    "page.dashboard.export.col.rank": "#",
    "page.dashboard.export.col.name": "ชื่อ",
    "page.customers.title": "ลูกค้า & คูปอง",
    "page.customers.subtitle":
      "ดูรายชื่อสมาชิก แต้มสะสม และจัดการคูปองส่วนลด (รวมแต้มที่ใช้แลกคูปอง)",
    "page.customers.export": "Export ข้อมูล",
    "page.customers.exportTitle": "ลูกค้า & คูปอง",
    "page.customers.createCoupon": "สร้างคูปองใหม่",
    "page.customers.report.memberTotal": "สมาชิกทั้งหมด",
    "page.customers.report.points": "พอยท์ในระบบ",
    "page.customers.report.couponUsedMonth": "คูปองถูกใช้ (เดือนนี้)",
    "page.customers.report.couponUsedMonthSub": "ยังไม่มีใน API",
    "page.customers.report.couponAvailable": "คูปองที่ใช้ได้",
    "page.customers.report.items": "รายการ",
    "page.customers.report.sub.people": "คน",
    "page.customers.report.sub.pointsFromLoaded": "Pts (จากรายการที่โหลด)",
    "page.customers.report.sub.notInApi": "ยังไม่มีใน API",
    "page.customers.export.metricsTitle": "สรุปข้อมูลลูกค้า (Customer Metrics)",
    "page.customers.export.metricsDesc": "จำนวนสมาชิกและพอยท์จาก API (รายการที่โหลด)",
    "page.customers.export.couponsTitle": "รายการคูปอง (Coupons)",
    "page.customers.export.couponsDesc": "คูปองทั้งหมดในระบบ",
    "page.products.title": "คลังสินค้าส่วนกลาง",
    "page.products.subtitle": "จัดการรายการสินค้า สต็อก และราคาทุกตู้จำหน่ายในระบบ",
    "page.products.exportReport": "Export รายงาน",
    "page.products.exportTitle": "คลังสินค้า (Inventory)",
    "page.products.addProduct": "เพิ่มสินค้าใหม่",
    "page.products.filterTitle": "ตัวกรองสินค้า",
    "page.products.categoryLabel": "หมวดหมู่สินค้า",
    "page.products.machineLabel": "สถานที่ติดตั้ง (ตู้)",
    "page.products.stockStatusLabel": "สถานะสต็อก",
    "page.products.clearFilters": "ล้างตัวกรอง",
    "page.products.allCategories": "ทุกหมวดหมู่",
    "page.products.allMachines": "ทุกตู้",
    "page.products.allStatuses": "ทุกสถานะ",
    "page.machines.title": "จัดการตู้สินค้า",
    "page.machines.subtitle":
      "ติดตามสถานะ สต็อกสินค้า และประสิทธิภาพของตู้จำหน่ายสินค้าอัตโนมัติแบบ Real-time",
    "page.machines.export": "Export",
    "page.machines.exportTitle": "จัดการตู้สินค้า",
    "page.machines.stat.total": "ตู้ทั้งหมด",
    "page.machines.stat.online": "พร้อมขาย (status=online)",
    "page.machines.stat.socket": "เชื่อมต่อ Socket (is_online)",
    "page.machines.stat.alerts": "แจ้งเตือน (สต็อกต่ำ + ERROR)",
    "page.machines.listTitle": "รายชื่อตู้ทั้งหมด",
    "page.machines.addMachine": "เพิ่มตู้สินค้า",
    "page.machines.emptyTitle": "ยังไม่มีตู้ในระบบ",
    "page.machines.emptyHint": "เพิ่มตู้ใหม่จากปุ่มด้านบน หรือตรวจสอบการเชื่อมต่อ API",
    "page.machines.addTileTitle": "เพิ่มตู้สินค้าใหม่",
    "page.machines.addTileHint": "คลิกเพื่อเชื่อมต่อและจัดการตู้ใหม่เข้ากับระบบส่วนกลาง",
    "page.orders.title": "ประวัติการสั่งซื้อ",
    "page.orders.subtitle": "ตรวจสอบและจัดการรายการธุรกรรมทั้งหมดในระบบ",
    "page.orders.export": "Export รายงาน",
    "page.orders.exportTitle": "คำสั่งซื้อ (Orders)",
    "page.orders.card.total": "ออเดอร์ทั้งหมด",
    "page.orders.card.pending": "รอดำเนินการ / ยกเลิก",
    "page.orders.card.completed": "สำเร็จแล้ว",
    "page.orders.card.revenue": "ยอดเงินรวม (ชุดที่โหลด)",
    "page.orders.tableTitle": "รายการออเดอร์ล่าสุด",
    "page.orders.col.orderId": "Order ID",
    "page.orders.col.time": "เวลา",
    "page.orders.col.machine": "ตู้",
    "page.orders.col.customer": "ลูกค้า",
    "page.orders.col.payment": "ช่องทางจ่าย",
    "page.orders.col.items": "สินค้า",
    "page.orders.col.total": "Total",
    "page.orders.col.status": "Status",
    "page.orders.empty": "ไม่มีออเดอร์ในชุดที่โหลด",
    "page.orders.emptyHint": "ลองรีเฟรชหรือตรวจสอบการเชื่อมต่อกับเซิร์ฟเวอร์",
    "page.orders.footer": "แสดง {loaded} รายการ (ทั้งหมดในระบบ {total} ตาม API)",
    "page.orders.badge.completed": "สำเร็จ",
    "page.orders.badge.refunded": "คืนเงิน",
    "page.orders.export.summaryLabel": "สรุปคำสั่งซื้อ (Orders Summary)",
    "page.orders.export.summaryDesc": "จำนวนออเดอร์ตามสถานะ (จากชุดข้อมูลที่โหลด)",
    "page.orders.export.col.metric": "สถานะ",
    "page.orders.export.col.value": "จำนวน",
    "page.orders.export.metric.totalApi": "ออเดอร์ทั้งหมด (API)",
    "page.orders.export.metric.pendingCancelled": "รอดำเนินการ / ยกเลิก",
    "page.orders.export.metric.completed": "สำเร็จแล้ว",
    "page.orders.export.metric.revenueApprox": "ยอดรวมในหน้า (ประมาณ)",
    "page.orders.export.listLabel": "รายการออเดอร์ (Order List)",
    "page.orders.export.listDesc": "รายละเอียดคำสั่งซื้อ",
    "page.alerts.title": "การแจ้งเตือน",
    "page.alerts.subtitle": "สต็อกต่ำและเหตุการณ์ ERROR จากตู้ (อัปเดตจาก API)",
    "page.alerts.includeResolved": "แสดง ERROR ที่ resolve แล้ว",
    "page.alerts.export": "Export รายงาน",
    "page.alerts.exportTitle": "การแจ้งเตือน (Alerts)",
    "page.alerts.sectionErrors": "ข้อผิดพลาดจากตู้ (ERROR)",
    "page.alerts.sectionLowStock": "สต็อกต่ำ (ต่ำกว่า {n})",
    "page.alerts.loading": "กำลังโหลด…",
    "page.alerts.empty": "ไม่มีรายการในขณะนี้",
    "page.alerts.emptyLow": "ไม่มีช่องที่ต่ำกว่าเกณฑ์",
    "page.alerts.resolve": "Resolve",
    "page.alerts.resolving": "กำลังดำเนินการ…",
    "page.alerts.badgeResolved": "แก้แล้ว",
    "page.alerts.lowStockTitle": "สต็อกต่ำ (ต่ำกว่า {n})",
    "page.alerts.remain": "คงเหลือ {n}",
    "page.alerts.slotLine": "({machine} · ช่อง {slot})",
    "page.alerts.machinePrefix": "· ตู้ ",
    "page.alerts.sectionChanges": "การเปลี่ยนแปลงโดยแอดมิน",
    "page.alerts.emptyChanges": "ยังไม่มีการเปลี่ยนแปลงจากแอดมินคนอื่น",
    "page.alerts.changeBy": "โดย {admin}",
    "page.alerts.action.updated_slots": "แก้ไขสต็อก/สินค้าในช่อง",
    "page.alerts.action.updated_metadata": "แก้ไขข้อมูลตู้ (ตำแหน่ง/สถานะ)",
    "page.alerts.action.unknown": "เปลี่ยนแปลงข้อมูลตู้",
    "alerts.toast.resolved": "ทำเครื่องหมายว่าแก้ไขแล้ว",
    "coupon.tab.all": "ทั้งหมด",
    "coupon.tab.active": "กำลังใช้งาน (Active)",
    "coupon.tab.expired": "หมดอายุ",
    "coupon.title": "คูปองส่วนลด",
    "coupon.apiNote": "ข้อมูลจาก API",
    "coupon.createNew": "สร้างคูปองใหม่",
    "coupon.searchPlaceholder": "ค้นหารหัสคูปอง…",
    "coupon.refresh": "รีเฟรช",
    "coupon.col.coupon": "คูปอง",
    "coupon.col.type": "ประเภท",
    "coupon.col.discount": "ส่วนลด",
    "coupon.col.points": "แลกแต้ม",
    "coupon.col.utilization": "การใช้งาน",
    "coupon.col.expiry": "หมดอายุ",
    "coupon.col.actions": "การทำงาน",
    "coupon.loading": "กำลังโหลด…",
    "coupon.empty": "ไม่มีคูปองในชุดนี้",
    "coupon.footer": "แสดง {n} รายการ",
    "coupon.redeemed": "Redeemed",
    "coupon.usageNotInApi": "นับจากออเดอร์ที่ชำระแล้ว",
    "coupon.redemptionsOpen": "ผู้ใช้คูปอง",
    "coupon.redemptionsTitle": "การใช้คูปอง",
    "coupon.redemptionsSubtitle": "สมาชิก = เบอร์โทรหลังสแกนรับแต้ม",
    "coupon.redemptionsEmpty": "ยังไม่มีการใช้คูปองนี้",
    "coupon.redemptionsClose": "ปิด",
    "coupon.redemptionsColUser": "ผู้ใช้",
    "coupon.redemptionsColOrder": "ออเดอร์",
    "coupon.redemptionsColDate": "วันที่",
    "coupon.redemptionsColAmount": "ยอด",
    "coupon.redemptionsColStatus": "สถานะ",
    "coupon.edit": "แก้ไข",
    "coupon.editTitle": "แก้ไขคูปอง",
    "coupon.editSubtitle": "รหัส ประเภทส่วนลด แต้มที่ใช้แลก (0 = ไม่บังคับแลกแต้ม)",
    "coupon.label.code": "รหัสคูปอง",
    "coupon.label.type": "ประเภท",
    "coupon.label.discountAmount": "จำนวนเงินส่วนลด (บาท)",
    "coupon.label.discountPercent": "เปอร์เซ็นต์ส่วนลด",
    "coupon.label.points": "แต้มที่ใช้แลก (points_cost)",
    "coupon.label.expiry": "หมดอายุ (เว้นว่าง = ไม่หมดอายุ)",
    "coupon.hint.expiryBangkok": "วันหมดอายุนับถึงสิ้นวัน (23:59) ตามเวลาไทย",
    "coupon.label.active": "เปิดใช้งาน (active)",
    "coupon.option.fixed": "จำนวนเงิน (fixed_amount)",
    "coupon.option.percent": "เปอร์เซ็นต์ (percent)",
    "coupon.cancel": "ยกเลิก",
    "coupon.save": "บันทึก",
    "coupon.saving": "กำลังบันทึก…",
    "coupon.pointsSuffix": "แต้ม",
    "coupon.filter.title": "ตัวกรองขั้นสูง",
    "coupon.filter.status": "สถานะ",
    "coupon.filter.couponType": "ประเภทคูปอง",
    "coupon.filter.expiryDate": "วันหมดอายุ",
    "coupon.filter.reset": "รีเซ็ต",
    "coupon.filter.apply": "ใช้ตัวกรอง",
    "coupon.filter.aria": "ตัวกรองขั้นสูง",
    "coupon.filter.opt.allStatus": "ทุกสถานะ",
    "coupon.filter.opt.active": "ใช้งาน",
    "coupon.filter.opt.inactive": "ปิดใช้งาน",
    "coupon.filter.opt.expired": "หมดอายุ",
    "coupon.filter.opt.allTypes": "ทุกประเภท",
    "coupon.filter.opt.percent": "เปอร์เซ็นต์ (%)",
    "coupon.filter.opt.fixed": "จำนวนเงินคงที่ (฿)",
    "coupon.error.loadFailed": "โหลดคูปองไม่สำเร็จ",
    "coupon.error.codeRequired": "กรุณากรอกรหัสคูปอง",
    "coupon.error.discountInvalid": "ส่วนลดไม่ถูกต้อง",
    "coupon.error.pointsInvalid": "แต้มที่ใช้แลกต้องเป็นจำนวนเต็ม ≥ 0",
    "coupon.error.saveFailed": "บันทึกไม่สำเร็จ",
    "coupon.capLabel": "สูงสุด: {cap}",
    "coupon.status.active": "ใช้งาน",
    "coupon.status.inactive": "ปิดใช้งาน",
    "coupon.status.expired": "หมดอายุ",
    "machine.detail.errorLoad": "โหลดข้อมูลตู้ไม่สำเร็จ",
    "machine.detail.toastRefreshed": "รีเฟรชข้อมูลจากระบบแล้ว",
    "machine.detail.toastRefreshFail": "รีเฟรชไม่สำเร็จ",
    "machine.detail.stat.slots": "ช่องทั้งหมด",
    "machine.detail.stat.qty": "จำนวนชิ้นในตู้",
    "machine.detail.stat.socket": "เชื่อมต่อ Socket (is_online)",
    "machine.detail.socketOn": "เชื่อมต่อ",
    "machine.detail.socketOff": "ไม่เชื่อมต่อ",
    "machine.detail.stat.dbUpdated": "อัปเดตล่าสุด (DB)",
    "machine.detail.stat.status": "สถานะปฏิบัติการ (status)",
    "machine.detail.toastSaved": "บันทึกสต็อกแล้ว",
    "machine.detail.toastSaveFail": "บันทึกสต็อกไม่สำเร็จ",
    "machine.detail.errorDuplicateSlot": "มีหมายเลขช่อง (slot) ซ้ำกัน กรุณาแก้ไขก่อนบันทึก",
    "machine.detail.locationUnknown": "ไม่ระบุสถานที่",
    "machine.detail.refreshing": "กำลังรีเฟรช…",
    "machine.detail.refresh": "รีเฟรชจากระบบ",
    "machine.detail.stockBySlot": "สต็อกตามช่อง",
    "machine.detail.cancelEdit": "ยกเลิกการแก้ไข",
    "machine.detail.saveStock": "บันทึกสต็อก",
    "machine.detail.saving": "กำลังบันทึก…",
    "machine.detail.loadingProducts": "กำลังโหลดรายการสินค้า…",
    "machine.detail.noProducts": "ยังไม่มีสินค้าในระบบ — เพิ่มสินค้าก่อนจึงจะตั้งสต็อกตู้ได้",
    "machine.detail.col.slot": "ช่อง",
    "machine.detail.col.product": "สินค้า",
    "machine.detail.col.qty": "จำนวน",
    "machine.detail.col.price": "ราคา",
    "machine.detail.notInList": "(ไม่พบในรายการ)",
    "machine.detail.removeSlot": "ลบช่อง",
    "machine.detail.saveHint":
      "ตู้: {code} — บันทึกจะแทนที่สต็อกทั้งหมดของตู้นี้ (สูงสุด {max} ช่อง) · จำนวน 0 = ตู้แสดง「สินค้าหมด」และซื้อไม่ได้",
    "machine.detail.slotEmpty": "ว่าง",
    "machine.detail.slotActivate": "+ เพิ่มสินค้า",
    "machine.detail.errorDuplicateProduct": "สินค้าในแต่ละช่องต้องไม่ซ้ำกัน กรุณาแก้ไขก่อนบันทึก",
    "page.alerts.export.errorsIncl": "รวมที่ resolve แล้ว",
    "page.alerts.export.errorsOnly": "เฉพาะที่ยังไม่ resolve",
    "page.alerts.export.lowThreshold": "เกณฑ์ quantity < {n}",
    "page.alerts.export.col.eventType": "ประเภท",
    "page.alerts.export.col.state": "สถานะ",
    "page.alerts.export.col.resolved": "แก้แล้ว",
    "page.alerts.machineLabel": "ตู้",
    "page.alerts.slotLabel": "ช่อง",
    "page.sales.title": "ประวัติธุรกรรม",
    "page.sales.subtitle": "ติดตามยอดขายและการชำระเงินแบบ Real-time",
    "page.sales.export": "Export ข้อมูลการขาย",
    "page.sales.exportTitle": "ยอดขาย (Sales)",
    "page.sales.card.today": "ยอดขายวันนี้",
    "page.sales.card.yesterday": "ยอดขายเมื่อวาน",
    "page.sales.card.avgOrder": "เฉลี่ยต่อออเดอร์",
    "page.sales.tableTitle": "รายการธุรกรรมล่าสุด",
    "page.sales.allLocations": "ทุกจุดติดตั้ง",
    "page.sales.col.transactionId": "Transaction ID",
    "page.sales.col.time": "Time",
    "page.sales.col.machine": "Machine",
    "page.sales.col.amount": "Amount",
    "page.sales.col.status": "Status",
    "page.sales.col.details": "Details",
    "page.reports.title": "รายงานและสถิติ",
    "page.reports.subtitle": "วิเคราะห์ประสิทธิภาพการทำงานและแนวโน้มยอดขายเชิงลึก",
    "page.reports.export": "Export",
    "page.reports.exportTitle": "สถิติและรายงาน (Reports)",
    "page.reports.card.totalSales": "ยอดขายรวม",
    "page.reports.card.totalSalesSub": "เทียบกับเดือนที่แล้ว (฿105,000)",
    "page.reports.card.avgMachine": "ยอดเฉลี่ยต่อตู้",
    "page.reports.card.avgMachineSub": "/เดือน",
    "page.reports.card.totalOrders": "ออเดอร์ทั้งหมด",
    "page.reports.card.ordersSub": "ออเดอร์",
    "page.reports.card.issues": "จำนวนการแจ้งปัญหา",
    "page.reports.card.issuesSub": "ครั้ง",
    "profile.joinedPrefix": "เข้าร่วมเมื่อ",
    "profile.editProfile": "จัดการโปรไฟล์",
    "profile.cancel": "ยกเลิก",
    "profile.save": "บันทึกข้อมูล",
    "profile.accountTitle": "ข้อมูลบัญชี",
    "profile.label.name": "ชื่อ-นามสกุล",
    "profile.label.firstName": "ชื่อ",
    "profile.label.lastName": "นามสกุล",
    "profile.label.role": "ตำแหน่ง",
    "profile.label.systemRole": "สิทธิ์ระบบ",
    "profile.label.email": "อีเมล",
    "profile.label.phone": "เบอร์โทรศัพท์",
    "profile.label.bio": "เกี่ยวกับฉัน",
    "profile.loading": "กำลังโหลดโปรไฟล์...",
    "profile.loadError": "โหลดข้อมูลโปรไฟล์ไม่สำเร็จ",
    "profile.saving": "กำลังบันทึก...",
    "profile.saveSuccess": "บันทึกโปรไฟล์สำเร็จ",
    "profile.saveFailed": "บันทึกโปรไฟล์ไม่สำเร็จ",
    "profile.emailReadonly": "อีเมลใช้สำหรับเข้าสู่ระบบ ไม่สามารถแก้ไขได้",
    "profile.positionPlaceholder": "เช่น ผู้จัดการคลังสินค้า",
    "profile.activityEmpty": "ยังไม่มีกิจกรรมที่บันทึกไว้ในเครื่องนี้",
    "profile.recentActivity": "กิจกรรมล่าสุด",
    "profile.viewAll": "ดูทั้งหมด",
    "profile.completionHint": "เพิ่มรูปหน้าปกเพื่อเพิ่มความสมบูรณ์เป็น 100% และรับเหรียญตรา \"Admin Elite\"",
    "profile.stat.machines": "ตู้ที่ดูแล",
    "profile.stat.rating": "เรตติ้ง",
    "profile.stat.totalSales": "ยอดขายรวม",
    "common.cancel": "ยกเลิก",
    "common.save": "บันทึก",
    "common.confirm": "ยืนยัน",
    "common.actions": "การทำงาน",
    "common.email": "อีเมล",
    "common.status": "สถานะ",
    "logout.title": "กำลังออกจากระบบ...",
    "logout.subtitle": "ขอบคุณที่ใช้งานระบบ MOD PAO Vending Management",
    "alerts.toast.machineErrorTitle": "ข้อผิดพลาดจากตู้ {code}",
    "alerts.toast.openAlerts": "เปิดหน้า Alerts เพื่อตรวจสอบและ Resolve",
    "page.dashboard.export.metric.salesToday": "ยอดขายวันนี้ (สำเร็จ)",
    "page.dashboard.export.metric.ordersToday": "จำนวนออเดอร์วันนี้ (สำเร็จ)",
    "page.dashboard.export.metric.machinesOnline": "ตู้ออนไลน์ / ทั้งหมด",
    "page.dashboard.export.metric.lowStock": "แจ้งเตือนสต็อกต่ำ (ช่อง)",
    "page.customers.error.loadFailed": "โหลดข้อมูลลูกค้าไม่สำเร็จ",
    "page.customers.export.metric.totalMembers": "สมาชิกทั้งหมด (API total)",
    "page.customers.export.metric.totalPoints": "พอยท์รวม (จากรายการที่โหลด)",
    "page.customers.export.metric.activeCoupons": "คูปองที่ใช้ได้ (active + ยังไม่หมดอายุ)",
    "page.customers.export.metric.couponsUsedMonth": "คูปองถูกใช้ (เดือนนี้)",
    "page.customers.export.units.people": "คน",
    "page.customers.export.units.items": "รายการ",
    "page.customers.export.units.notInApi": "— (ยังไม่มี endpoint)",
    "page.customers.export.col.couponId": "รหัสคูปอง",
    "page.customers.export.col.couponName": "ชื่อคูปอง",
    "page.customers.export.col.couponType": "ประเภท",
    "page.customers.export.col.couponPoints": "แต้มที่ใช้แลก",
    "page.customers.export.col.couponUsage": "ถูกใช้แล้ว",
    "page.customers.export.col.couponMaxUsage": "ใช้ได้สูงสุด",
    "page.customers.export.col.couponExpiry": "วันหมดอายุ",
    "page.customers.export.col.couponStatus": "สถานะ",
    "page.products.export.desc": "รายการสินค้า, หมวดหมู่, สต็อก และราคา",
    "page.products.export.col.code": "รหัสสินค้า",
    "page.products.export.col.name": "ชื่อสินค้า",
    "page.products.export.col.category": "หมวดหมู่",
    "page.products.export.col.machines": "จำนวนตู้",
    "page.products.export.col.qty": "จำนวนสต็อก",
    "page.products.export.col.price": "ราคา/ชิ้น (฿)",
    "page.products.export.col.status": "สถานะ",
    "page.machines.error.loadFailed": "โหลดรายการตู้ไม่สำเร็จ กรุณาลองใหม่",
    "page.machines.export.desc": "ข้อมูลตู้สินค้าทั้งหมดในระบบ",
    "page.machines.export.col.id": "รหัสตู้",
    "page.machines.export.col.name": "ชื่อตู้",
    "page.machines.export.col.location": "สถานที่",
    "page.machines.export.col.status": "สถานะ",
    "customer.table.title": "รายชื่อสมาชิก",
    "customer.table.apiNote": "ข้อมูลจาก",
    "customer.table.col.phone": "เบอร์โทร",
    "customer.table.col.points": "แต้ม",
    "customer.table.col.status": "สถานะ",
    "customer.table.col.registered": "สมัครเมื่อ",
    "customer.table.col.lastUse": "ใช้งานล่าสุด",
    "customer.table.empty": "ยังไม่มีสมาชิกในชุดนี้",
    "customer.table.footer": "แสดง {n} รายการ",
    "product.table.col.info": "ข้อมูลสินค้า",
    "product.table.col.category": "หมวดหมู่",
    "product.table.col.machines": "จำนวนตู้ที่จำหน่าย",
    "product.table.col.qty": "คงเหลือ",
    "product.table.col.price": "ราคา",
    "product.table.col.status": "สถานะ",
    "product.table.col.actions": "จัดการ",
    "product.table.empty": "ไม่พบข้อมูลสินค้าที่ค้นหา",
    "product.table.installPoint": "จุดติดตั้ง",
    "product.table.unit": "ชิ้น",
    "product.table.titleEdit": "แก้ไขข้อมูล",
    "product.table.titleHistory": "ดูประวัติสต็อก",
    "product.table.footer": "แสดง {filtered} รายการ (จากทั้งหมด {total} ที่โหลด)",
    "product.refresh": "รีเฟรช",
    "machine.card.statusOnline": "พร้อมขาย",
    "machine.card.statusMaintenance": "ซ่อมบำรุง",
    "machine.card.statusOffline": "ออฟไลน์",
    "machine.card.opStatusTitle": "สถานะปฏิบัติการในฐานข้อมูล (machines.status)",
    "machine.card.socketTitle": "Pi agent เชื่อม Socket (machines.is_online — ไม่รวมจอ kiosk)",
    "machine.card.socketOn": "เชื่อมต่อ",
    "machine.card.socketOff": "ไม่เชื่อมต่อ",
    "addMachine.errorRequired": "กรุณากรอกรหัสตู้ (Machine ID)",
    "addMachine.errorCodeMaxLength": "รหัสตู้ต้องไม่เกิน 20 ตัวอักษร",
    "addMachine.errorFailed": "สร้างตู้ไม่สำเร็จ",
    "addMachine.modalTitleNew": "เพิ่มตู้สินค้าใหม่",
    "addMachine.modalTitleSuccess": "สร้างตู้สำเร็จ",
    "addMachine.success.savedTag": "บันทึกแล้ว",
    "addMachine.success.headline": "เก็บข้อมูลด้านล่างให้ปลอดภัย",
    "addMachine.success.tokenWarning":
      "Token นี้แสดงเพียงครั้งเดียว — คัดลอกไปใส่ไฟล์ .env ของฮาร์ดแวร์ทันที",
    "addMachine.success.done": "เสร็จสิ้น",
    "addMachine.upload.placeholder": "อัปโหลดรูปภาพ (ไม่บันทึกในระบบ)",
    "addMachine.uiNote": "รูปและประเภทตู้ด้านล่างใช้เพื่ออ้างอิงในหน้าจอเท่านั้น ข้อมูลที่ส่งไป API คือรหัสตู้ สถานที่ และสถานะ",
    "addMachine.label.machineId": "รหัสตู้ (Machine ID)",
    "addMachine.placeholder.machineId": "เช่น MP1-002",
    "addMachine.label.location": "สถานที่ตั้ง (Location)",
    "addMachine.placeholder.location": "ไม่บังคับ — เช่น หอใน มจธ.",
    "addMachine.label.status": "สถานะตู้ (ส่งไป API)",
    "addMachine.label.machineType": "ประเภทตู้ (อ้างอิงในหน้าจอ)",
    "addMachine.option.cool": "ตู้แช่เย็น (Cooling)",
    "addMachine.option.hot": "ตู้เครื่องดื่มร้อน (Hot)",
    "addMachine.option.snack": "ตู้ขนม (Snacks)",
    "addMachine.creating": "กำลังสร้าง…",
    "addMachine.confirm": "ยืนยันการเพิ่มตู้สินค้า",
    "editMachine.title": "แก้ไขข้อมูลตู้ขายสินค้า",
    "editMachine.note": "รหัสตู้ (machine_code) อ่านอย่างเดียวจากฐานข้อมูล — แก้ได้เฉพาะสถานที่และสถานะปฏิบัติการ",
    "editMachine.label.machineId": "รหัสตู้",
    "editMachine.label.location": "สถานที่ตั้ง (location)",
    "editMachine.placeholder.location": "เว้นว่างได้ — จะบันทึกเป็นค่าว่างในระบบ",
    "editMachine.label.status": "สถานะปฏิบัติการ (status ในฐานข้อมูล)",
    "editMachine.option.online": "พร้อมขาย (online)",
    "editMachine.option.maintenance": "ซ่อมบำรุง (maintenance)",
    "editMachine.option.offline": "ปิด / ออฟไลน์ (offline)",
    "editMachine.errorNotFound": "ไม่พบรหัสตู้",
    "editMachine.toastSaved": "บันทึกข้อมูลตู้แล้ว",
    "editMachine.toastFailed": "บันทึกไม่สำเร็จ",
    "editMachine.saving": "กำลังบันทึก…",
    "editMachine.save": "บันทึกการแก้ไข",
    "addProduct.title": "เพิ่มสินค้าใหม่ในคลัง",
    "addProduct.errorInvalid": "กรอกชื่อและราคาให้ถูกต้อง",
    "addProduct.errorPriceMin": "ราคาต้องเป็นจำนวนเต็มไม่น้อยกว่า {min} บาท",
    "addProduct.toastCreated": "เพิ่มสินค้าสำเร็จ",
    "addProduct.label.name": "ชื่อสินค้า",
    "addProduct.placeholder.name": "ชื่อสินค้า",
    "addProduct.label.imageUrl": "ลิงก์รูปภาพ (URL)",
    "addProduct.placeholder.imageUrl": "https://... หรือ /product/img/...",
    "addProduct.label.category": "หมวดหมู่",
    "addProduct.label.unitPrice": "ราคาต่อชิ้น (฿)",
    "addProduct.label.heatingTime": "เวลาอุ่น (วินาที)",
    "addProduct.hint.heatingTime": "จำนวนเต็ม 1–3600 วินาที (ค่าเริ่มต้น 15)",
    "addProduct.errorHeatingTime": "เวลาอุ่นต้องเป็นจำนวนเต็ม 1–3600 วินาที",
    "addProduct.label.description": "รายละเอียด",
    "addProduct.placeholder.description": "รายละเอียดสินค้า...",
    "addProduct.note": "สต็อกต่อตู้แก้ที่เมนูตู้จำหน่าย — API สินค้าไม่เก็บจำนวนคงเหลือรวม",
    "addProduct.creating": "กำลังบันทึก...",
    "addProduct.confirm": "ยืนยันการเพิ่มสินค้า",
    "productImage.upload": "อัปโหลด",
    "productImage.uploading": "กำลังอัปโหลด...",
    "productImage.previewAlt": "ตัวอย่างรูปสินค้า",
    "productImage.invalidUrl": "ลิงก์รูปไม่ถูกต้อง (ใช้ /product/img/... หรือ https://...)",
    "productImage.uploadFailed": "อัปโหลดรูปไม่สำเร็จ",
    "productImage.uploadSuccess": "อัปโหลดรูปแล้ว",
    "editProduct.title": "แก้ไขข้อมูลสินค้า",
    "editProduct.errorNotFound": "ไม่พบรหัสสินค้า",
    "editProduct.toastSaved": "บันทึกการแก้ไขสินค้าสำเร็จ",
    "editProduct.idLabel": "รหัสสินค้า (product_id):",
    "editProduct.saving": "กำลังบันทึก...",
    "editProduct.save": "บันทึกการแก้ไข",
    "createCoupon.headline": "Create New Coupon",
    "createCoupon.subtitle": "สร้างคูปองใหม่ผ่าน API",
    "createCoupon.errorRequired": "กรุณากรอกรหัสคูปอง (Coupon Code)",
    "createCoupon.errorDiscount": "จำนวนส่วนลดต้องมากกว่า 0",
    "createCoupon.errorPercentMax": "ส่วนลดแบบเปอร์เซ็นต์ต้องไม่เกิน 100%",
    "createCoupon.errorPoints": "แต้มที่ใช้แลกต้องเป็นจำนวนเต็มไม่น้อยกว่า 0",
    "createCoupon.errorFailed": "สร้างคูปองไม่สำเร็จ",
    "createCoupon.placeholder.code": "เช่น PAO2026",
    "createCoupon.placeholder.points": "0 = ไม่ต้องใช้แต้ม",
    "createCoupon.label.validTo": "Valid To (เว้นว่าง = ไม่หมดอายุ)",
    "createCoupon.label.maxUses": "จำกัดจำนวนครั้ง (ใบ)",
    "createCoupon.placeholder.maxUses": "0 = ไม่จำกัด",
    "createCoupon.hint.maxUses": "จำนวนครั้งที่ใช้ได้ทั้งระบบ (ทุกเครื่องรวมกัน)",
    "createCoupon.errorMaxUses": "จำนวนครั้งต้องเป็นจำนวนเต็มไม่น้อยกว่า 0",
    "createCoupon.label.activate": "เปิดใช้งานทันที (is_active)",
    "createCoupon.creating": "กำลังสร้าง…",
    "manageStock.title": "จัดการสต็อคสินค้า (Manage Stock)",
    "manageStock.subtitle": "อัปเดตจำนวนสินค้าภายในตู้",
    "manageStock.addProduct": "เพิ่มสินค้าใหม่",
    "manageStock.addModalTitle": "เพิ่มสินค้าใหม่",
    "manageStock.addModalSubtitle": "เลือกสินค้าจากคลังเพื่อเพิ่มลงในตู้",
    "manageStock.searchPlaceholder": "ค้นหาชื่อสินค้า หรือรหัสสินค้า...",
    "manageStock.empty": "ไม่พบสินค้าที่ค้นหา",
    "manageStock.initialQty": "ระบุจำนวนเริ่มต้น",
    "manageStock.confirmAdd": "ยืนยันการเพิ่ม",
    "manageStock.table.col.edit": "แก้ไข",
    "manageStock.table.col.productName": "ชื่อสินค้า",
    "manageStock.table.col.quantity": "จำนวน",
    "manageStock.table.col.status": "สถานะ",
    "manageStock.status.out": "หมดสต็อก",
    "manageStock.status.low": "ใกล้หมด",
    "manageStock.status.in": "พร้อมขาย",
    "manageStock.cancel": "ยกเลิก",
    "manageStock.saveChanges": "บันทึกการเปลี่ยนแปลง",
    "manageStock.confirm.saveTitle": "ยืนยันการบันทึก",
    "manageStock.confirm.discardTitle": "ทิ้งการเปลี่ยนแปลง",
    "manageStock.confirm.saveBody": "คุณต้องการบันทึกการเปลี่ยนแปลงนี้ใช่ไหม?",
    "manageStock.confirm.discardBody": "คุณต้องการทิ้งการเปลี่ยนแปลงนี้ใช่ไหม?",
    "manageStock.confirm.noGoBack": "ไม่, กลับไปก่อน",
    "manageStock.confirm.yesSave": "ใช่, บันทึก",
    "manageStock.confirm.yesDiscard": "ใช่, ทิ้ง",
    "exportModal.title": "ส่งออกข้อมูล",
    "exportModal.step1": "1 — เลือกข้อมูลที่ต้องการ",
    "exportModal.step2": "2 — รูปแบบไฟล์",
    "exportModal.selectAll": "เลือกทั้งหมด",
    "exportModal.clearAll": "ล้างทั้งหมด",
    "exportModal.selectAtLeast": "กรุณาเลือกข้อมูลอย่างน้อย 1 อย่าง",
    "exportModal.noCsvData": "ไม่มีข้อมูลสำหรับ CSV",
    "exportModal.exporting": "กำลังส่งออก...",
    "exportModal.download": "ดาวน์โหลดข้อมูล ({n} รายการ)",
    "settings.notif.title": "การแจ้งเตือน (Notifications)",
    "settings.notif.lowStockTitle": "สินค้าใกล้หมด (Low Stock Alerts)",
    "settings.notif.lowStockDesc": "แจ้งเตือนเมื่อสินค้าในตู้มีจำนวนน้อยกว่าที่กำหนด",
    "settings.notif.systemTitle": "สถานะระบบ (System Errors)",
    "settings.notif.systemDesc": "แจ้งเตือนเมื่อระบบขัดข้องหรือเครื่องมีปัญหา",
    "settings.password.title": "จัดการรหัสผ่าน (Password)",
    "settings.password.current": "รหัสผ่านปัจจุบัน",
    "settings.password.new": "รหัสผ่านใหม่",
    "settings.password.confirm": "ยืนยันรหัสผ่านใหม่",
    "settings.password.submit": "เปลี่ยนรหัสผ่าน",
    "settings.password.submitting": "กำลังบันทึก...",
    "settings.password.hintMinLength": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    "settings.password.success": "เปลี่ยนรหัสผ่านสำเร็จ",
    "settings.password.errorMismatch": "รหัสผ่านใหม่กับยืนยันไม่ตรงกัน",
    "settings.password.errorMinLength": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    "settings.password.errorFailed": "เปลี่ยนรหัสผ่านไม่สำเร็จ",
    "settings.phone.title": "อัปเดตเบอร์โทรศัพท์",
    "settings.phone.successTitle": "อัปเดตเบอร์โทรศัพท์สำเร็จ",
    "settings.phone.newLabel": "เบอร์ใหม่:",
    "settings.phone.currentLabel": "เบอร์โทรศัพท์ปัจจุบัน",
    "settings.phone.newField": "เบอร์โทรศัพท์ใหม่",
    "settings.phone.placeholder": "08X-XXX-XXXX",
    "settings.phone.sendOtp": "ส่งรหัส OTP",
    "settings.phone.otpHint": "กรุณากรอกรหัส OTP ที่ส่งไปยังเบอร์",
    "settings.phone.otpLabel": "รหัส OTP 6 หลัก",
    "settings.phone.confirmOtp": "ยืนยัน OTP",
    "settings.admin.deniedTitle": "การเข้าถึงถูกปฏิเสธ",
    "settings.admin.deniedDesc": "เฉพาะ First Admin เท่านั้นที่สามารถจัดการสิทธิ์ผู้ดูแลระบบได้",
    "settings.admin.inviteTitle": "เชิญผู้ดูแลระบบใหม่",
    "settings.admin.inviteDesc": "ผู้ที่ได้รับเชิญจะสามารถเข้าสู่ระบบและสร้างบัญชีได้",
    "settings.admin.tempPasswordLabel": "รหัสผ่านชั่วคราว",
    "settings.admin.tempPasswordPlaceholder": "ตั้งรหัสผ่านชั่วคราว",
    "settings.admin.sendInvite": "ส่งคำเชิญ",
    "settings.admin.listTitle": "รายชื่อผู้ที่ได้รับอนุญาต (Authorized Admin List)",
    "settings.admin.empty": "ยังไม่มีผู้ดูแลระบบที่ได้รับเชิญ",
    "settings.admin.revoke": "Revoke",
    "settings.admin.revokeTitle": "Revoke Access",
    "settings.admin.revokeWarn": "การกระทำนี้ไม่สามารถย้อนกลับได้",
    "settings.admin.revokeConfirmText": "คุณแน่ใจหรือไม่ว่าจะถอนสิทธิ์ของ",
    "settings.admin.revokeYes": "ใช่, ถอนสิทธิ์",
    "security.title": "ความปลอดภัย",
    "security.subtitle": "จัดการการตั้งค่าความปลอดภัยและการเข้าถึงบัญชีของคุณด้วยระบบมาตรฐานสากล",
    "security.changePassword": "เปลี่ยนรหัสผ่าน",
    "security.changePasswordDesc": "เราขอแนะนำให้คุณใช้รหัสผ่านที่รัดกุมและเปลี่ยนเป็นประจำเพื่อความปลอดภัยสูงสุด",
    "security.update": "อัปเดตรหัสผ่านใหม่",
    "security.twoFA": "ยืนยันตัวตนสองชั้น (2FA)",
    "security.twoFADesc": "เพิ่มชั้นความปลอดภัยอีกระดับด้วยรหัสยืนยันตัวตนจากสมาร์ทโฟนของคุณ",
    "security.twoFAOn": "ระบบ 2FA เปิดใช้งานอยู่",
    "security.twoFAOff": "ระบบ 2FA ปิดอยู่ (ไม่แนะนำ)",
    "security.twoFANote":
      "เมื่อเปิดใช้งาน คุณจะต้องป้อนรหัสความปลอดภัยจากแอปยืนยันตัวตน (เช่น Google Authenticator) ทุกครั้งที่เข้าสู่ระบบจากอุปกรณ์ใหม่",
    "security.twoFAConfigure": "กำหนดค่าแอปยืนยันตัวตน",
    "security.twoFASetup": "เริ่มต้นตั้งค่า 2FA",
    "security.sessions": "เซสชันที่ใช้งานอยู่",
    "security.sessionsDesc": "รายการอุปกรณ์ที่เข้าสู่ระบบบัญชีของคุณในขณะนี้",
    "security.sessionCurrent": "Current Session",
    "security.sessionLogoutOthers": "ออกจากระบบเซสชันอื่นๆ ทั้งหมด",
    "datePicker.label": "ระบุช่วงเวลา",
    "datePicker.title": "เลือกช่วงเวลา",
    "datePicker.from": "ตั้งแต่เดือน",
    "datePicker.to": "ถึงเดือน",
    "datePicker.through": "ถึง",
    "datePicker.clear": "ล้าง",
    "datePicker.apply": "ตกลง",
    "chart.loading": "กำลังโหลดกราฟยอดขาย…",
    "chart.empty": "ยังไม่มีข้อมูลยอดขายในช่วงที่เลือก",
    "chart.title": "กราฟยอดการขาย",
    "chart.machineTitle": "กราฟยอดขายตู้",
    "chart.dashboardTitle": "แนวโน้มยอดขาย",
    "chart.subtitle": "รายได้รายวัน (ออเดอร์สำเร็จ) จาก API — ช่วง {n} วันล่าสุด",
    "chart.rangeLabel": "ระบุช่วงเวลา:",
    "chart.revenue": "รายได้",
    "chart.ordersUnit": "ออเดอร์",
    "page.sales.badge.paid": "ชำระแล้ว",
    "page.sales.badge.processing": "กำลังดำเนินการ",
    "page.sales.badge.failed": "ล้มเหลว",
    "page.sales.pagination": "ประวัติธุรกรรม หน้า {current} จาก {total}",
    "page.sales.previous": "ก่อนหน้า",
    "page.sales.next": "หน้าถัดไป",
    "profile.activity.refill": "เติมสินค้าในตู้",
    "profile.activity.firmware": "อัปเดตเฟิร์มแวร์ตู้",
    "profile.activity.cashCheck": "ตรวจสอบยอดเงินสดประจำวัน",
    "profile.activity.minutesAgo": "{n} นาทีที่แล้ว",
    "profile.activity.hoursAgo": "{n} ชั่วโมงที่แล้ว",
    "profile.activity.yesterdayAt": "เมื่อวานนี้, {time}",
    "security.session.location": "กรุงเทพฯ, ประเทศไทย",
    "security.session.activeNow": "ใช้งานเมื่อครู่",
    "security.session.logoutDevice": "ออกจากระบบของอุปกรณ์นี้",
    "salesByLocation.title": "ยอดขายตามสถานที่",
    "salesByLocation.subtitle": "การกระจายยอดขายในวิทยาเขต",
    "salesByLocation.contribution": "{n}% ของยอดรวม",
    "salesByLocation.loc1": "อาคาร LX (พหุวิทยาการ)",
    "salesByLocation.loc2": "อาคารวิศวกรรมศาสตร์ S11",
    "salesByLocation.loc3": "อาคาร CB1",
    "salesByLocation.loc4": "หอพักนักศึกษา",
    "salesByFlavor.title": "ยอดขายแยกตามรสชาติ",
    "salesByFlavor.subtitle": "ความนิยมของแต่ละรสชาติ",
    "salesByFlavor.f1": "เปาหมูสับ",
    "salesByFlavor.f2": "เปาครีม",
    "salesByFlavor.f3": "เปามดแดง",
    "salesByFlavor.f4": "เปากุ้ง",
    "salesByFlavor.f5": "เปาเห็ดหอม",
    "salesByFlavor.f6": "เปาเต้าหู้",
    "page.orders.itemsLabel": "{lines} รายการ ({qty} ชิ้น)",
    "deleteMachine.button": "ลบตู้นี้",
    "deleteMachine.confirmTitle": "ยืนยันการลบตู้",
    "deleteMachine.confirmBody": "คุณกำลังจะลบตู้ {code} ออกจากระบบ การดำเนินการนี้ไม่สามารถย้อนกลับได้",
    "deleteMachine.confirmYes": "ใช่, ลบตู้นี้",
    "deleteMachine.deleting": "กำลังลบ…",
    "deleteMachine.toastDeleted": "ลบตู้สำเร็จ",
    "deleteMachine.toastFailed": "ลบตู้ไม่สำเร็จ",
    "deleteCoupon.button": "ลบคูปอง",
    "deleteCoupon.confirmTitle": "ยืนยันการลบคูปอง",
    "deleteCoupon.confirmBody": "คุณกำลังจะลบคูปอง {code} ออกจากระบบ การดำเนินการนี้ไม่สามารถย้อนกลับได้",
    "deleteCoupon.confirmYes": "ใช่, ลบคูปอง",
    "deleteCoupon.deleting": "กำลังลบ…",
    "deleteCoupon.toastDeleted": "ลบคูปองสำเร็จ",
    "deleteCoupon.toastFailed": "ลบคูปองไม่สำเร็จ",
    "deleteProduct.button": "ลบสินค้านี้",
    "deleteProduct.confirmTitle": "ยืนยันการลบสินค้า",
    "deleteProduct.confirmBody": "คุณกำลังจะลบสินค้า \"{name}\" ออกจากระบบ การดำเนินการนี้ไม่สามารถย้อนกลับได้",
    "deleteProduct.confirmYes": "ใช่, ลบสินค้านี้",
    "deleteProduct.deleting": "กำลังลบ…",
    "deleteProduct.toastDeleted": "ลบสินค้าสำเร็จ",
    "deleteProduct.toastFailed": "ลบสินค้าไม่สำเร็จ",
  },
  en: {
    "nav.dashboard": "Dashboard",
    "nav.products": "Products",
    "nav.machines": "Machines",
    "nav.orders": "Orders",
    "nav.customersCoupons": "Customers & Coupons",
    "nav.settings": "Settings",
    "nav.logout": "Log out",
    "header.notifications": "Notifications",
    "header.notificationsMarkAllRead": "Mark all as read",
    "header.notificationsEmpty": "No new notifications",
    "header.notificationsViewAll": "View all",
    "header.profile": "Profile",
    "header.settings": "Settings",
    "header.logout": "Log out",
    "header.searchPlaceholder": "Search machines, products, customers, orders, or menus…",
    "header.palette.hint": "Type to search products, machines, customers, and orders—or pick a shortcut below.",
    "header.palette.searching": "Searching…",
    "header.palette.noResults": "No database results for",
    "header.palette.menu": "Menu",
    "header.palette.products": "Products",
    "header.palette.machines": "Machines",
    "header.palette.customers": "Customers",
    "header.palette.orders": "Orders",
    "settings.title": "Settings",
    "settings.subtitle": "Customize appearance, security, and admin permissions.",
    "settings.tabs.general": "General",
    "settings.tabs.security": "Security",
    "settings.tabs.admin": "Admin",
    "settings.displayTitle": "Display",
    "settings.darkModeTitle": "Dark mode",
    "settings.darkModeDesc": "Switch the UI to a dark color scheme.",
    "settings.languageTitle": "Language",
    "settings.languageDesc": "Choose the language used in the admin UI.",
    "common.refresh": "Refresh",
    "common.export": "Export",
    "common.exportReport": "Export report",
    "common.exportData": "Export data",
    "common.loading": "Loading…",
    "common.loadingDots": "Loading…",
    "page.dashboard.title": "Overview dashboard",
    "page.dashboard.subtitle":
      "Operational overview of all vending machines, reports, and sales trends.",
    "page.dashboard.loading": "Loading dashboard…",
    "page.dashboard.errorLoad": "Failed to load dashboard",
    "page.dashboard.exportModalTitle": "Dashboard overview",
    "page.dashboard.card.salesToday": "Sales today",
    "page.dashboard.card.ordersToday": "Orders today",
    "page.dashboard.card.machinesReady": "Machines ready",
    "page.dashboard.card.lowStock": "Low stock alerts",
    "page.dashboard.export.overview": "Overview stats",
    "page.dashboard.export.overviewDesc": "Sales, orders, and machine readiness.",
    "page.dashboard.export.salesSeries": "Daily sales (series)",
    "page.dashboard.export.salesSeriesDesc": "Last {days} days from /api/admin/reports/sales",
    "page.dashboard.export.topProducts": "Top products (from summary)",
    "page.dashboard.export.topProductsDesc": "Top from /api/admin/dashboard/summary",
    "page.dashboard.export.col.topic": "Metric",
    "page.dashboard.export.col.value": "Value",
    "page.dashboard.export.col.date": "Date",
    "page.dashboard.export.col.revenue": "Revenue (฿)",
    "page.dashboard.export.col.orders": "Orders",
    "page.dashboard.export.col.rank": "#",
    "page.dashboard.export.col.name": "Name",
    "page.customers.title": "Customers & coupons",
    "page.customers.subtitle":
      "View members, points, and discount coupons (including points redemption).",
    "page.customers.export": "Export data",
    "page.customers.exportTitle": "Customers & coupons",
    "page.customers.createCoupon": "Create coupon",
    "page.customers.report.memberTotal": "Total members",
    "page.customers.report.points": "Points in system",
    "page.customers.report.couponUsedMonth": "Coupons used (this month)",
    "page.customers.report.couponUsedMonthSub": "Not in API yet",
    "page.customers.report.couponAvailable": "Available coupons",
    "page.customers.report.items": "items",
    "page.customers.report.sub.people": "people",
    "page.customers.report.sub.pointsFromLoaded": "Pts (from loaded rows)",
    "page.customers.report.sub.notInApi": "Not in API yet",
    "page.customers.export.metricsTitle": "Customer metrics",
    "page.customers.export.metricsDesc": "Members and points from API (loaded rows).",
    "page.customers.export.couponsTitle": "Coupons",
    "page.customers.export.couponsDesc": "All coupons in the system.",
    "page.products.title": "Central inventory",
    "page.products.subtitle": "Manage products, stock, and pricing across machines.",
    "page.products.exportReport": "Export report",
    "page.products.exportTitle": "Inventory",
    "page.products.addProduct": "Add product",
    "page.products.filterTitle": "Filters",
    "page.products.categoryLabel": "Category",
    "page.products.machineLabel": "Machine location",
    "page.products.stockStatusLabel": "Stock status",
    "page.products.clearFilters": "Clear filters",
    "page.products.allCategories": "All categories",
    "page.products.allMachines": "All machines",
    "page.products.allStatuses": "All statuses",
    "page.machines.title": "Machine management",
    "page.machines.subtitle":
      "Monitor status, stock, and performance of vending machines in near real time.",
    "page.machines.export": "Export",
    "page.machines.exportTitle": "Machine management",
    "page.machines.stat.total": "Total machines",
    "page.machines.stat.online": "Ready (status=online)",
    "page.machines.stat.socket": "Socket connected (is_online)",
    "page.machines.stat.alerts": "Alerts (low stock + ERROR)",
    "page.machines.listTitle": "All machines",
    "page.machines.addMachine": "Add machine",
    "page.machines.emptyTitle": "No machines yet",
    "page.machines.emptyHint": "Add a machine above or check your API connection.",
    "page.machines.addTileTitle": "Add a new machine",
    "page.machines.addTileHint": "Click to connect and register a new machine.",
    "page.orders.title": "Order history",
    "page.orders.subtitle": "Review and manage all transactions.",
    "page.orders.export": "Export report",
    "page.orders.exportTitle": "Orders",
    "page.orders.card.total": "Total orders",
    "page.orders.card.pending": "Pending / cancelled",
    "page.orders.card.completed": "Completed",
    "page.orders.card.revenue": "Total amount (loaded set)",
    "page.orders.tableTitle": "Latest orders",
    "page.orders.col.orderId": "Order ID",
    "page.orders.col.time": "Time",
    "page.orders.col.machine": "Machine",
    "page.orders.col.customer": "Customer",
    "page.orders.col.payment": "Payment",
    "page.orders.col.items": "Items",
    "page.orders.col.total": "Total",
    "page.orders.col.status": "Status",
    "page.orders.empty": "No orders in the loaded set",
    "page.orders.emptyHint": "Try refreshing or check the server connection.",
    "page.orders.footer": "Showing {loaded} items (API total: {total})",
    "page.orders.badge.completed": "Completed",
    "page.orders.badge.refunded": "Refunded",
    "page.orders.export.summaryLabel": "Orders summary",
    "page.orders.export.summaryDesc": "Counts by status (from the loaded dataset).",
    "page.orders.export.col.metric": "Metric",
    "page.orders.export.col.value": "Value",
    "page.orders.export.metric.totalApi": "Total orders (API)",
    "page.orders.export.metric.pendingCancelled": "Pending / cancelled",
    "page.orders.export.metric.completed": "Completed",
    "page.orders.export.metric.revenueApprox": "Page total (approx.)",
    "page.orders.export.listLabel": "Order list",
    "page.orders.export.listDesc": "Order details",
    "page.alerts.title": "Alerts",
    "page.alerts.subtitle": "Low stock and machine ERROR events (from API).",
    "page.alerts.includeResolved": "Show resolved ERROR items",
    "page.alerts.export": "Export report",
    "page.alerts.exportTitle": "Alerts",
    "page.alerts.sectionErrors": "Machine errors (ERROR)",
    "page.alerts.sectionLowStock": "Low stock (below {n})",
    "page.alerts.loading": "Loading…",
    "page.alerts.empty": "Nothing to show right now",
    "page.alerts.emptyLow": "No slots below the threshold",
    "page.alerts.resolve": "Resolve",
    "page.alerts.resolving": "Working…",
    "page.alerts.badgeResolved": "Resolved",
    "page.alerts.lowStockTitle": "Low stock (below {n})",
    "page.alerts.remain": "Remaining {n}",
    "page.alerts.slotLine": "({machine} · slot {slot})",
    "page.alerts.machinePrefix": "· Machine ",
    "page.alerts.sectionChanges": "Admin changes",
    "page.alerts.emptyChanges": "No changes from other admins yet",
    "page.alerts.changeBy": "by {admin}",
    "page.alerts.action.updated_slots": "Updated slot inventory/products",
    "page.alerts.action.updated_metadata": "Updated machine info (location/status)",
    "page.alerts.action.unknown": "Modified machine data",
    "alerts.toast.resolved": "Marked as resolved",
    "coupon.tab.all": "All",
    "coupon.tab.active": "Active",
    "coupon.tab.expired": "Expired",
    "coupon.title": "Discount coupons",
    "coupon.apiNote": "Data from API",
    "coupon.createNew": "Create coupon",
    "coupon.searchPlaceholder": "Search coupon code…",
    "coupon.refresh": "Refresh",
    "coupon.col.coupon": "Coupon",
    "coupon.col.type": "Type",
    "coupon.col.discount": "Discount",
    "coupon.col.points": "Points",
    "coupon.col.utilization": "Utilization",
    "coupon.col.expiry": "Expiry",
    "coupon.col.actions": "Actions",
    "coupon.loading": "Loading…",
    "coupon.empty": "No coupons in this set",
    "coupon.footer": "Showing {n} items",
    "coupon.redeemed": "Redeemed",
    "coupon.usageNotInApi": "Counted from paid orders",
    "coupon.redemptionsOpen": "Who used",
    "coupon.redemptionsTitle": "Coupon redemptions",
    "coupon.redemptionsSubtitle": "Member = phone after loyalty scan · Otherwise unknown",
    "coupon.redemptionsEmpty": "No redemptions yet",
    "coupon.redemptionsClose": "Close",
    "coupon.redemptionsColUser": "User",
    "coupon.redemptionsColOrder": "Order",
    "coupon.redemptionsColDate": "Date",
    "coupon.redemptionsColAmount": "Amount",
    "coupon.redemptionsColStatus": "Status",
    "coupon.edit": "Edit",
    "coupon.editTitle": "Edit coupon",
    "coupon.editSubtitle": "Code, discount type, points to redeem (0 = optional)",
    "coupon.label.code": "Coupon code",
    "coupon.label.type": "Type",
    "coupon.label.discountAmount": "Discount amount (THB)",
    "coupon.label.discountPercent": "Discount percent",
    "coupon.label.points": "Points cost (points_cost)",
    "coupon.label.expiry": "Expiry (empty = none)",
    "coupon.hint.expiryBangkok": "Expiry is end of that calendar day (23:59) in Thailand time",
    "coupon.label.active": "Active",
    "coupon.option.fixed": "Fixed amount (fixed_amount)",
    "coupon.option.percent": "Percent (percent)",
    "coupon.cancel": "Cancel",
    "coupon.save": "Save",
    "coupon.saving": "Saving…",
    "coupon.pointsSuffix": "pts",
    "coupon.filter.title": "Advanced filter",
    "coupon.filter.status": "Status",
    "coupon.filter.couponType": "Coupon type",
    "coupon.filter.expiryDate": "Expiry date",
    "coupon.filter.reset": "Reset",
    "coupon.filter.apply": "Apply",
    "coupon.filter.aria": "Advanced filter",
    "coupon.filter.opt.allStatus": "All statuses",
    "coupon.filter.opt.active": "Active",
    "coupon.filter.opt.inactive": "Inactive",
    "coupon.filter.opt.expired": "Expired",
    "coupon.filter.opt.allTypes": "All types",
    "coupon.filter.opt.percent": "Percentage (%)",
    "coupon.filter.opt.fixed": "Fixed amount (฿)",
    "coupon.error.loadFailed": "Failed to load coupons",
    "coupon.error.codeRequired": "Please enter a coupon code",
    "coupon.error.discountInvalid": "Invalid discount",
    "coupon.error.pointsInvalid": "Points must be an integer ≥ 0",
    "coupon.error.saveFailed": "Save failed",
    "coupon.capLabel": "Cap: {cap}",
    "coupon.status.active": "Active",
    "coupon.status.inactive": "Inactive",
    "coupon.status.expired": "Expired",
    "machine.detail.errorLoad": "Failed to load machine",
    "machine.detail.toastRefreshed": "Refreshed from server",
    "machine.detail.toastRefreshFail": "Refresh failed",
    "machine.detail.stat.slots": "Total slots",
    "machine.detail.stat.qty": "Units in machine",
    "machine.detail.stat.socket": "Socket (is_online)",
    "machine.detail.socketOn": "Connected",
    "machine.detail.socketOff": "Disconnected",
    "machine.detail.stat.dbUpdated": "Last DB update",
    "machine.detail.stat.status": "Operational status",
    "machine.detail.toastSaved": "Stock saved",
    "machine.detail.toastSaveFail": "Failed to save stock",
    "machine.detail.errorDuplicateSlot": "Duplicate slot numbers — fix before saving",
    "machine.detail.locationUnknown": "Location not set",
    "machine.detail.refreshing": "Refreshing…",
    "machine.detail.refresh": "Refresh from server",
    "machine.detail.stockBySlot": "Stock by slot",
    "machine.detail.cancelEdit": "Cancel edits",
    "machine.detail.saveStock": "Save stock",
    "machine.detail.saving": "Saving…",
    "machine.detail.loadingProducts": "Loading products…",
    "machine.detail.noProducts": "No products yet — add products before stocking.",
    "machine.detail.col.slot": "Slot",
    "machine.detail.col.product": "Product",
    "machine.detail.col.qty": "Qty",
    "machine.detail.col.price": "Price",
    "machine.detail.notInList": "(not in catalog)",
    "machine.detail.removeSlot": "Remove slot",
    "machine.detail.saveHint":
      "Machine: {code} — saving replaces all stock for this machine (max {max} slots). Qty 0 shows as sold out on the kiosk and cannot be purchased.",
    "machine.detail.slotEmpty": "Empty",
    "machine.detail.slotActivate": "+ Add product",
    "machine.detail.errorDuplicateProduct": "Each slot must have a unique product. Please fix duplicates before saving.",
    "page.alerts.export.errorsIncl": "Including resolved",
    "page.alerts.export.errorsOnly": "Unresolved only",
    "page.alerts.export.lowThreshold": "Threshold: quantity < {n}",
    "page.alerts.export.col.eventType": "Event type",
    "page.alerts.export.col.state": "State",
    "page.alerts.export.col.resolved": "Resolved",
    "page.alerts.machineLabel": "Machine",
    "page.alerts.slotLabel": "Slot",
    "page.sales.title": "Transaction history",
    "page.sales.subtitle": "Track sales and payments in real time.",
    "page.sales.export": "Export sales data",
    "page.sales.exportTitle": "Sales",
    "page.sales.card.today": "Today's sales",
    "page.sales.card.yesterday": "Yesterday's sales",
    "page.sales.card.avgOrder": "Avg. per order",
    "page.sales.tableTitle": "Latest transactions",
    "page.sales.allLocations": "All locations",
    "page.sales.col.transactionId": "Transaction ID",
    "page.sales.col.time": "Time",
    "page.sales.col.machine": "Machine",
    "page.sales.col.amount": "Amount",
    "page.sales.col.status": "Status",
    "page.sales.col.details": "Details",
    "page.reports.title": "Reports & analytics",
    "page.reports.subtitle": "Analyze performance and sales trends in depth.",
    "page.reports.export": "Export",
    "page.reports.exportTitle": "Reports",
    "page.reports.card.totalSales": "Total sales",
    "page.reports.card.totalSalesSub": "vs. last month (฿105,000)",
    "page.reports.card.avgMachine": "Avg. per machine",
    "page.reports.card.avgMachineSub": "/month",
    "page.reports.card.totalOrders": "Total orders",
    "page.reports.card.ordersSub": "orders",
    "page.reports.card.issues": "Issues reported",
    "page.reports.card.issuesSub": "times",
    "profile.joinedPrefix": "Joined",
    "profile.editProfile": "Edit profile",
    "profile.cancel": "Cancel",
    "profile.save": "Save changes",
    "profile.accountTitle": "Account info",
    "profile.label.name": "Full name",
    "profile.label.firstName": "First name",
    "profile.label.lastName": "Last name",
    "profile.label.role": "Position",
    "profile.label.systemRole": "System role",
    "profile.label.email": "Email",
    "profile.label.phone": "Phone",
    "profile.label.bio": "About me",
    "profile.loading": "Loading profile...",
    "profile.loadError": "Could not load profile",
    "profile.saving": "Saving...",
    "profile.saveSuccess": "Profile saved",
    "profile.saveFailed": "Could not save profile",
    "profile.emailReadonly": "Email is used to sign in and cannot be changed here",
    "profile.positionPlaceholder": "e.g. Inventory manager",
    "profile.activityEmpty": "No activity recorded on this device yet",
    "profile.recentActivity": "Recent activity",
    "profile.viewAll": "View all",
    "profile.completionHint": "Add a cover photo to reach 100% and earn the \"Admin Elite\" badge.",
    "profile.stat.machines": "Machines managed",
    "profile.stat.rating": "Rating",
    "profile.stat.totalSales": "Total sales",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.confirm": "Confirm",
    "common.actions": "Actions",
    "common.email": "Email",
    "common.status": "Status",
    "logout.title": "Signing out…",
    "logout.subtitle": "Thanks for using MOD PAO Vending Management",
    "alerts.toast.machineErrorTitle": "Error from machine {code}",
    "alerts.toast.openAlerts": "Open the Alerts page to inspect and resolve",
    "page.dashboard.export.metric.salesToday": "Sales today (success)",
    "page.dashboard.export.metric.ordersToday": "Orders today (success)",
    "page.dashboard.export.metric.machinesOnline": "Machines online / total",
    "page.dashboard.export.metric.lowStock": "Low-stock alerts (slots)",
    "page.customers.error.loadFailed": "Failed to load customer data",
    "page.customers.export.metric.totalMembers": "Total members (API total)",
    "page.customers.export.metric.totalPoints": "Total points (loaded)",
    "page.customers.export.metric.activeCoupons": "Active coupons (active + not expired)",
    "page.customers.export.metric.couponsUsedMonth": "Coupons used (this month)",
    "page.customers.export.units.people": "people",
    "page.customers.export.units.items": "items",
    "page.customers.export.units.notInApi": "— (no endpoint yet)",
    "page.customers.export.col.couponId": "Coupon code",
    "page.customers.export.col.couponName": "Coupon name",
    "page.customers.export.col.couponType": "Type",
    "page.customers.export.col.couponPoints": "Points cost",
    "page.customers.export.col.couponUsage": "Used",
    "page.customers.export.col.couponMaxUsage": "Max usage",
    "page.customers.export.col.couponExpiry": "Expires",
    "page.customers.export.col.couponStatus": "Status",
    "page.products.export.desc": "Products, categories, stock and prices",
    "page.products.export.col.code": "Product code",
    "page.products.export.col.name": "Product name",
    "page.products.export.col.category": "Category",
    "page.products.export.col.machines": "Machines",
    "page.products.export.col.qty": "Stock qty",
    "page.products.export.col.price": "Price/unit (฿)",
    "page.products.export.col.status": "Status",
    "page.machines.error.loadFailed": "Failed to load machines, please try again",
    "page.machines.export.desc": "All vending machines in the system",
    "page.machines.export.col.id": "Machine ID",
    "page.machines.export.col.name": "Machine name",
    "page.machines.export.col.location": "Location",
    "page.machines.export.col.status": "Status",
    "customer.table.title": "Member list",
    "customer.table.apiNote": "Data from",
    "customer.table.col.phone": "Phone",
    "customer.table.col.points": "Points",
    "customer.table.col.status": "Status",
    "customer.table.col.registered": "Registered",
    "customer.table.col.lastUse": "Last use",
    "customer.table.empty": "No members in this set",
    "customer.table.footer": "Showing {n} item(s)",
    "product.table.col.info": "Product info",
    "product.table.col.category": "Category",
    "product.table.col.machines": "Machines selling",
    "product.table.col.qty": "Stock",
    "product.table.col.price": "Price",
    "product.table.col.status": "Status",
    "product.table.col.actions": "Actions",
    "product.table.empty": "No matching products",
    "product.table.installPoint": "install points",
    "product.table.unit": "pcs",
    "product.table.titleEdit": "Edit",
    "product.table.titleHistory": "Stock history",
    "product.table.footer": "Showing {filtered} item(s) (of {total} loaded)",
    "product.refresh": "Refresh",
    "machine.card.statusOnline": "Online",
    "machine.card.statusMaintenance": "Maintenance",
    "machine.card.statusOffline": "Offline",
    "machine.card.opStatusTitle": "Operational status (machines.status)",
    "machine.card.socketTitle": "Pi agent Socket (machines.is_online — not kiosk UI)",
    "machine.card.socketOn": "Connected",
    "machine.card.socketOff": "Disconnected",
    "addMachine.errorRequired": "Please enter the Machine ID",
    "addMachine.errorCodeMaxLength": "Machine ID must be at most 20 characters",
    "addMachine.errorFailed": "Failed to create machine",
    "addMachine.modalTitleNew": "Add new machine",
    "addMachine.modalTitleSuccess": "Machine created",
    "addMachine.success.savedTag": "Saved",
    "addMachine.success.headline": "Keep the data below safe",
    "addMachine.success.tokenWarning":
      "This token is shown only once — copy it to your hardware agent's .env immediately.",
    "addMachine.success.done": "Done",
    "addMachine.upload.placeholder": "Upload image (not stored)",
    "addMachine.uiNote": "Image and machine type are for UI reference only. The API only stores ID, location, and status.",
    "addMachine.label.machineId": "Machine ID",
    "addMachine.placeholder.machineId": "e.g., MP1-002",
    "addMachine.label.location": "Location",
    "addMachine.placeholder.location": "Optional — e.g., KMUTT dorm",
    "addMachine.label.status": "Machine status (sent to API)",
    "addMachine.label.machineType": "Machine type (UI only)",
    "addMachine.option.cool": "Cooling vending",
    "addMachine.option.hot": "Hot beverage",
    "addMachine.option.snack": "Snacks",
    "addMachine.creating": "Creating…",
    "addMachine.confirm": "Confirm and add machine",
    "editMachine.title": "Edit vending machine",
    "editMachine.note": "machine_code is read-only — only location and operational status can be changed.",
    "editMachine.label.machineId": "Machine ID",
    "editMachine.label.location": "Location",
    "editMachine.placeholder.location": "Leave blank to clear in DB",
    "editMachine.label.status": "Operational status (DB status)",
    "editMachine.option.online": "Online",
    "editMachine.option.maintenance": "Maintenance",
    "editMachine.option.offline": "Offline",
    "editMachine.errorNotFound": "Machine ID not found",
    "editMachine.toastSaved": "Machine saved",
    "editMachine.toastFailed": "Save failed",
    "editMachine.saving": "Saving…",
    "editMachine.save": "Save changes",
    "addProduct.title": "Add new product",
    "addProduct.errorInvalid": "Please enter a valid name and price",
    "addProduct.errorPriceMin": "Price must be a whole number of at least {min} THB",
    "addProduct.toastCreated": "Product created",
    "addProduct.label.name": "Product name",
    "addProduct.placeholder.name": "Product name",
    "addProduct.label.imageUrl": "Image URL",
    "addProduct.placeholder.imageUrl": "https://… or /product/img/…",
    "addProduct.label.category": "Category",
    "addProduct.label.unitPrice": "Unit price (฿)",
    "addProduct.label.heatingTime": "Heating time (seconds)",
    "addProduct.hint.heatingTime": "Whole seconds 1–3600 (default 15)",
    "addProduct.errorHeatingTime": "Heating time must be a whole number from 1 to 3600 seconds",
    "addProduct.label.description": "Description",
    "addProduct.placeholder.description": "Product description…",
    "addProduct.note": "Adjust per-machine stock from the machine page — the product API does not track total qty.",
    "addProduct.creating": "Saving…",
    "addProduct.confirm": "Confirm",
    "productImage.upload": "Upload",
    "productImage.uploading": "Uploading…",
    "productImage.previewAlt": "Product preview",
    "productImage.invalidUrl": "Invalid image URL (use /product/img/… or https://…)",
    "productImage.uploadFailed": "Image upload failed",
    "productImage.uploadSuccess": "Image uploaded",
    "editProduct.title": "Edit product",
    "editProduct.errorNotFound": "Product ID not found",
    "editProduct.toastSaved": "Product saved",
    "editProduct.idLabel": "product_id:",
    "editProduct.saving": "Saving…",
    "editProduct.save": "Save changes",
    "createCoupon.headline": "Create New Coupon",
    "createCoupon.subtitle": "Create a coupon via API",
    "createCoupon.errorRequired": "Please enter the Coupon Code",
    "createCoupon.errorDiscount": "Discount value must be greater than 0",
    "createCoupon.errorPercentMax": "Percentage discount cannot exceed 100%",
    "createCoupon.errorPoints": "Points must be a non-negative integer",
    "createCoupon.errorFailed": "Failed to create coupon",
    "createCoupon.placeholder.code": "e.g., PAO2026",
    "createCoupon.placeholder.points": "0 = no points required",
    "createCoupon.label.validTo": "Valid To (blank = no expiry)",
    "createCoupon.label.maxUses": "Max redemptions",
    "createCoupon.placeholder.maxUses": "0 = unlimited",
    "createCoupon.hint.maxUses": "Total uses allowed across all machines",
    "createCoupon.errorMaxUses": "Max uses must be a non-negative integer",
    "createCoupon.label.activate": "Activate immediately (is_active)",
    "createCoupon.creating": "Creating…",
    "manageStock.title": "Manage Stock",
    "manageStock.subtitle": "Update product quantities in this machine",
    "manageStock.addProduct": "Add product",
    "manageStock.addModalTitle": "Add product",
    "manageStock.addModalSubtitle": "Pick a product from inventory to add",
    "manageStock.searchPlaceholder": "Search by product name or code…",
    "manageStock.empty": "No matching products",
    "manageStock.initialQty": "Initial quantity",
    "manageStock.confirmAdd": "Confirm",
    "manageStock.table.col.edit": "Edit",
    "manageStock.table.col.productName": "Product name",
    "manageStock.table.col.quantity": "Quantity",
    "manageStock.table.col.status": "Status",
    "manageStock.status.out": "Out of stock",
    "manageStock.status.low": "Low stock",
    "manageStock.status.in": "In stock",
    "manageStock.cancel": "Cancel",
    "manageStock.saveChanges": "Save changes",
    "manageStock.confirm.saveTitle": "Confirm save",
    "manageStock.confirm.discardTitle": "Discard changes",
    "manageStock.confirm.saveBody": "Are you sure you want to save these changes?",
    "manageStock.confirm.discardBody": "Are you sure you want to discard these changes?",
    "manageStock.confirm.noGoBack": "No, go back",
    "manageStock.confirm.yesSave": "Yes, save",
    "manageStock.confirm.yesDiscard": "Yes, discard",
    "exportModal.title": "Export data",
    "exportModal.step1": "1 — Pick the data you want",
    "exportModal.step2": "2 — File format",
    "exportModal.selectAll": "Select All",
    "exportModal.clearAll": "Clear All",
    "exportModal.selectAtLeast": "Please pick at least 1 item",
    "exportModal.noCsvData": "No data for CSV",
    "exportModal.exporting": "Exporting…",
    "exportModal.download": "Download data ({n} item(s))",
    "settings.notif.title": "Notifications",
    "settings.notif.lowStockTitle": "Low Stock Alerts",
    "settings.notif.lowStockDesc": "Notify when machine stock falls below threshold",
    "settings.notif.systemTitle": "System Errors",
    "settings.notif.systemDesc": "Notify when the system or hardware misbehaves",
    "settings.password.title": "Password",
    "settings.password.current": "Current password",
    "settings.password.new": "New password",
    "settings.password.confirm": "Confirm new password",
    "settings.password.submit": "Change password",
    "settings.password.submitting": "Saving...",
    "settings.password.hintMinLength": "Password must be at least 6 characters",
    "settings.password.success": "Password changed successfully",
    "settings.password.errorMismatch": "New password and confirmation do not match",
    "settings.password.errorMinLength": "Password must be at least 6 characters",
    "settings.password.errorFailed": "Could not change password",
    "settings.phone.title": "Update phone number",
    "settings.phone.successTitle": "Phone number updated",
    "settings.phone.newLabel": "New number:",
    "settings.phone.currentLabel": "Current phone number",
    "settings.phone.newField": "New phone number",
    "settings.phone.placeholder": "08X-XXX-XXXX",
    "settings.phone.sendOtp": "Send OTP",
    "settings.phone.otpHint": "Please enter the OTP sent to",
    "settings.phone.otpLabel": "6-digit OTP",
    "settings.phone.confirmOtp": "Confirm OTP",
    "settings.admin.deniedTitle": "Access denied",
    "settings.admin.deniedDesc": "Only the First Admin can manage admin permissions",
    "settings.admin.inviteTitle": "Invite a new admin",
    "settings.admin.inviteDesc": "Invitees can sign in and create their account",
    "settings.admin.tempPasswordLabel": "Temporary password",
    "settings.admin.tempPasswordPlaceholder": "Set a temporary password",
    "settings.admin.sendInvite": "Send invite",
    "settings.admin.listTitle": "Authorized Admin List",
    "settings.admin.empty": "No invited admins yet",
    "settings.admin.revoke": "Revoke",
    "settings.admin.revokeTitle": "Revoke Access",
    "settings.admin.revokeWarn": "This action cannot be undone.",
    "settings.admin.revokeConfirmText": "Are you sure you want to revoke access for",
    "settings.admin.revokeYes": "Yes, revoke",
    "security.title": "Security",
    "security.subtitle": "Manage your security and account access with industry-standard tooling",
    "security.changePassword": "Change password",
    "security.changePasswordDesc": "Use a strong password and rotate it regularly",
    "security.update": "Update password",
    "security.twoFA": "Two-factor authentication (2FA)",
    "security.twoFADesc": "Add an extra layer of security via a code from your phone",
    "security.twoFAOn": "2FA is enabled",
    "security.twoFAOff": "2FA is off (not recommended)",
    "security.twoFANote":
      "When enabled you'll need to enter a code from your authenticator app (e.g. Google Authenticator) every time you sign in from a new device.",
    "security.twoFAConfigure": "Configure authenticator app",
    "security.twoFASetup": "Set up 2FA",
    "security.sessions": "Active sessions",
    "security.sessionsDesc": "Devices currently signed in to your account",
    "security.sessionCurrent": "Current Session",
    "security.sessionLogoutOthers": "Sign out of all other sessions",
    "datePicker.label": "Pick a date range",
    "datePicker.title": "Select range",
    "datePicker.from": "From month",
    "datePicker.to": "To month",
    "datePicker.through": "to",
    "datePicker.clear": "Clear",
    "datePicker.apply": "Apply",
    "chart.loading": "Loading sales chart…",
    "chart.empty": "No sales data for the selected range",
    "chart.title": "Sales chart",
    "chart.machineTitle": "Machine sales chart",
    "chart.dashboardTitle": "Sales trend",
    "chart.subtitle": "Daily revenue (successful orders) — last {n} days",
    "chart.rangeLabel": "Range:",
    "chart.revenue": "Revenue",
    "chart.ordersUnit": "orders",
    "page.sales.badge.paid": "Paid",
    "page.sales.badge.processing": "Processing",
    "page.sales.badge.failed": "Failed",
    "page.sales.pagination": "Transaction History — page {current} of {total}",
    "page.sales.previous": "Previous",
    "page.sales.next": "Next page",
    "profile.activity.refill": "Restocked machine",
    "profile.activity.firmware": "Updated machine firmware",
    "profile.activity.cashCheck": "Daily cash reconciliation",
    "profile.activity.minutesAgo": "{n} min ago",
    "profile.activity.hoursAgo": "{n} hours ago",
    "profile.activity.yesterdayAt": "Yesterday at {time}",
    "security.session.location": "Bangkok, Thailand",
    "security.session.activeNow": "Active just now",
    "security.session.logoutDevice": "Logout from device",
    "salesByLocation.title": "Sales by Location",
    "salesByLocation.subtitle": "Distribution across campus",
    "salesByLocation.contribution": "{n}% Contribution",
    "salesByLocation.loc1": "LX Building (Multidisciplinary)",
    "salesByLocation.loc2": "S11 Engineering Building",
    "salesByLocation.loc3": "CB1 Building",
    "salesByLocation.loc4": "Student Dormitory",
    "salesByFlavor.title": "Sales by Flavor",
    "salesByFlavor.subtitle": "Popularity across flavors",
    "salesByFlavor.f1": "Minced Pork Bun",
    "salesByFlavor.f2": "Cream Bun",
    "salesByFlavor.f3": "Red Ant Bun",
    "salesByFlavor.f4": "Shrimp Bun",
    "salesByFlavor.f5": "Shiitake Bun",
    "salesByFlavor.f6": "Tofu Bun",
    "page.orders.itemsLabel": "{lines} lines ({qty} pcs)",
    "deleteMachine.button": "Delete machine",
    "deleteMachine.confirmTitle": "Confirm machine deletion",
    "deleteMachine.confirmBody": "You are about to delete machine {code}. This action cannot be undone.",
    "deleteMachine.confirmYes": "Yes, delete machine",
    "deleteMachine.deleting": "Deleting…",
    "deleteMachine.toastDeleted": "Machine deleted",
    "deleteMachine.toastFailed": "Failed to delete machine",
    "deleteCoupon.button": "Delete coupon",
    "deleteCoupon.confirmTitle": "Confirm coupon deletion",
    "deleteCoupon.confirmBody": "You are about to delete coupon {code}. This action cannot be undone.",
    "deleteCoupon.confirmYes": "Yes, delete coupon",
    "deleteCoupon.deleting": "Deleting…",
    "deleteCoupon.toastDeleted": "Coupon deleted",
    "deleteCoupon.toastFailed": "Failed to delete coupon",
    "deleteProduct.button": "Delete product",
    "deleteProduct.confirmTitle": "Confirm product deletion",
    "deleteProduct.confirmBody": "You are about to delete \"{name}\". This action cannot be undone.",
    "deleteProduct.confirmYes": "Yes, delete product",
    "deleteProduct.deleting": "Deleting…",
    "deleteProduct.toastDeleted": "Product deleted",
    "deleteProduct.toastFailed": "Failed to delete product",
  },
};

export function normalizeLang(input: string | null | undefined): Lang {
  return input === "en" ? "en" : "th";
}
