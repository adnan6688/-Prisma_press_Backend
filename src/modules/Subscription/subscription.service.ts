import Stripe from "stripe"
import config from "../../config"
import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe"
import { SubsCriptionStatus } from "../../../generated/prisma/enums"


const createCheckOutSession = async (userId: string) => {



    const transectionResult = await prisma.$transaction(async (tx) => {

        const user = await tx.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                subscription: true
            }
        })


        let stripeCustomerId = user.subscription?.stripeCustomarId
        if (!stripeCustomerId) {

            const customer = await stripe.customers.create({
                email: user?.email,
                name: user?.name,
                metadata: {
                    userId: user?.id,
                    role: user?.role
                }

            })

            stripeCustomerId = customer.id
        }


        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: config.stripe_product_id,
                    quantity: 1
                }
            ],
            mode: "subscription",
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            success_url: `${config.app_url}/premium?success=true`,
            cancel_url: `${config.app_url}/payment?success=false`,
            metadata: {
                userId
            }
        })

        return session.url


    })

    return {
        paymentURl: transectionResult
    }

}

const handleWebhook = async (payload: Buffer, signature: string) => {

    const endpointSecret = config.web_hook_secret

    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
    )

    switch (event.type) {

        case 'checkout.session.completed':
            // Occurs when a Checkout Session has been successfully completed.
            await handleChecoutSession(event.data.object)
            break
        case 'customer.subscription.updated':

            break

        case 'customer.subscription.deleted':
            break;

        default:
            console.log("No event match")
            break


    }
}


const handleChecoutSession = async (session: Stripe.Checkout.Session) => {

    const userId = session.metadata?.userId as string
    const stripeCustomarId = session.customer as string
    const stripeSubscriptionId = session.subscription as string

    if (!userId || !stripeCustomarId || !stripeSubscriptionId) {
        throw new Error('Webhook Failed!')
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    const currentPeriodEndInMILiSeconde = stripeSubscription.items.data[0]?.current_period_end!
    const currentPeriodEnd = new Date(currentPeriodEndInMILiSeconde * 1000)


    await prisma.subsCription.upsert({
        where: {
            userId: userId
        },
        create: {
            userId,
            stripeCustomarId,
            stripeSubscriptionId,
            currentPeriodEnd
        },
        update: {
            stripeCustomarId,
            stripeSubscriptionId,
            status: SubsCriptionStatus.ACTIVE,
            currentPeriodEnd
        }

    })

}


const handlleChangeSubscriptions = async (payload : Stripe.Subscription) => {

    const stripeSubscriptionId = payload.id 
    const status = payload.status
    
}

export const subscriptionService = {
    createCheckOutSession,
    handleWebhook
}