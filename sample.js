import dotenv from "dotenv";
dotenv.config();
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES modules equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log(`github token: ${process.env["GITHUB_TOKEN"]}`);
const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";
//read image path from file system and encoding it to base64
const imagePath = path.join(__dirname, "contoso_layout_sketch.jpg");
const image = fs.readFileSync(imagePath);
const imageBase64 = image.toString("base64");

export async function main() {
    const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token),
    );

    //pass the image as a base64 encoded string in the request body  
    const response = await client.path("/chat/completions").post({
        body: {
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { 
                    role: "user", 
                    content: [
                        { type: "text", text: "Write an HTML and CSS code for a web page based on the following hand-drawn sketch" },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
                    ]
                }
            ],
            temperature: 1.0,
            top_p: 1.0,
            max_tokens: 2048,
            model: model
        }
    });

    //   throw response.body;
    if (isUnexpected(response)) {
        throw response.body.error;
    }

    console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});

