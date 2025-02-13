const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');

async function sendRandomQuestion(agent) {
    try {
        const randomQuestions = JSON.parse(fs.readFileSync('random_questions.json', 'utf-8'));
        const randomQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];

        const payload = { message: randomQuestion, stream: false };
        const response = await axios.post(`https://${agent.toLowerCase().replace('_', '-')}.stag-vxzy.zettablock.com/main`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error('Invalid response from API');
        }

        return { question: randomQuestion, response: response.data.choices[0].message };
    } catch (error) {
        console.error(chalk.red('⚠️ API Error:'), error.response ? error.response.data : error.message);

        return { 
            question: "No question due to error", 
            response: { content: "No response due to API error" } 
        }; // Prevents crash
    }
}

async function main() {
    console.log(chalk.green('📌 11 wallet addresses loaded from nano_wallets.txt'));

    const wallets = fs.readFileSync('nano_wallets.txt', 'utf-8').split('\n').filter(wallet => wallet.trim() !== '');
    const agent = "Professor";

    for (let i = 0; i < wallets.length; i++) {
        let wallet = wallets[i].trim();
        console.log(chalk.blue(`\n🚀 Processing wallet: ${wallet}`));
        console.log(chalk.yellow(`🤖 Using Agent: ${agent} 🧠`));

        try {
            console.log(`----------------------------------------`);
            console.log(chalk.cyan(`🔄 Iteration-${i + 1} for ${wallet}`));

            const result = await sendRandomQuestion(agent);
            console.log(chalk.cyan('❓ Query:'), chalk.bold(result.question));
            console.log(chalk.green('💬 Response:'), result.response.content);

        } catch (error) {
            console.error(chalk.red('❌ Processing Error:'), error.message);
        }

        // 🔄 **Delay before next wallet processing (60 sec for better API stability)**
        console.log(chalk.magenta('\n⏳ Waiting for 60 seconds before next wallet...'));
        await new Promise(resolve => setTimeout(resolve, 60000));
    }

    console.log(chalk.green('\n✅ All wallets processed successfully!'));
}

// Start Execution
main().catch(error => console.error(chalk.red('🚨 Fatal Error:'), error.message));
