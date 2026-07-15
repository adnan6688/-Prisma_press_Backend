import cookieParser from "cookie-parser";
import express, { Application, NextFunction, Request, Response } from "express";
import cors from 'cors'
import config from "./config";
const app: Application = express();
import { userRoutes } from "./modules/users/users.route";
import { AuthRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comments/comments.route";
import { NotFound } from "./middlewares/notFound";
import { GlobalErrorHandler } from "./middlewares/globalErrorHandler";
import { subsCriptionRoutes } from "./modules/Subscription/subscription.route";


// app.post('/api/subscription/webhook', express.raw({ type: 'application/json' }), (request, response) => {
//     let event = request.body;
//     console.log("srtipe request body", event)

//     if (endpointSecret) {
//         const signature = request.headers['stripe-signature']!;
//         console.log("stripe signature ", signature)
//         try {
//             event = Stripe.webhooks.constructEvent(
//                 request.body,
//                 signature,
//                 endpointSecret
//             );
//         } catch (err: any) {
//             console.log(`⚠️  Webhook signature verification failed.`, err.message);
//             return response.status(400).json({
//                 message: err.message,
//                 success: false
//             });
//         }
//     }

//     console.log("event modified", event)

//     switch (event.type) {
//         case 'payment_intent.succeeded':
//             const paymentIntent = event.data.object;
//             console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//             // Then define and call a method to handle the successful payment intent.
//             // handlePaymentIntentSucceeded(paymentIntent);
//             break;
//         case 'payment_method.attached':
//             const paymentMethod = event.data.object;
//             // Then define and call a method to handle the successful attachment of a PaymentMethod.
//             // handlePaymentMethodAttached(paymentMethod);
//             break;
//         default:
//             // Unexpected event type
//             console.log(`Unhandled event type ${event.type}.`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
// })

app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }))



app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: config.app_url,
    credentials: true
}))



app.get('/', async (req: Request, res: Response) => {
    res.send('Welcome to our prisma press site!')
})


app.use('/api/user', userRoutes)
app.use('/api/auth', AuthRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/subscription', subsCriptionRoutes)



// not found middle ware
app.use(NotFound)



// jodi amra kono middleware ar modde para metters a err ta  ni tah hole seta global error handler
app.use(GlobalErrorHandler)

export default app