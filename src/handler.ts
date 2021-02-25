import {APIGatewayProxyResult, Callback, Context, Handler} from "aws-lambda";
import Path from "path-parser";

const handler: Handler = async (event: any, context: Context, callback: Callback): Promise<APIGatewayProxyResult> => {
    // Request integrity checks
    if (!event) {
        console.error("No event");
    }

    if (event.body) {
        let payload: any = {};

        try {
            payload = JSON.parse(event.body);
        } catch (e) {
            console.error(e);
        }

        Object.assign(event, { body: payload });
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: Math.floor(Math.random() * 10)
        })
    };
};

export { handler };

