import { Router } from "express";
import { subsCriptionController } from "./subscription.controller";
import { auth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router()


router.post('/checkout', auth(...Object.values(UserRole)), subsCriptionController.createCheckOutSession)

router.post('/webhook' , subsCriptionController.handleWebhook )

export const subsCriptionRoutes = router