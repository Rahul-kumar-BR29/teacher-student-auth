import express from "express";
import authenticate from "../middleware/authenticate.js";
import allowRoles from "../middleware/allowRoles.js";
// import {
//   listPendingTeachers,
//   updateTeacherApproval,
// } from "../controllers/adminController.js";

import {
  listPendingTeachers,
  updateTeacherApproval,
  getStats,
  getUsersList,
  deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get(
  "/teachers/pending",
  authenticate,
  allowRoles("admin"),
  listPendingTeachers,
);

router.patch(
  "/teachers/:id/approval",
  authenticate,
  allowRoles("admin"),
  updateTeacherApproval,
);

router.get("/stats", authenticate, allowRoles("admin"), getStats);

router.get("/users", authenticate, allowRoles("admin"), getUsersList);

router.delete("/users/:id", authenticate, allowRoles("admin"), deleteUser);

export default router;
