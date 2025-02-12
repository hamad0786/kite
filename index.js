const axios = require('axios');
const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk');

const agents = {
  "deployment_p5J9lz1Zxe7CYEoo0TZpRVay": "Professor 🧠",
  "deployment_7sZJSiCqCNDy9bBHTEh7dwd9": "Crypto Buddy 💰",
  "deployment_SoFftlsf9z4fyA3QCHYkaANq": "Sherlock 🔎"
};

function displayAppTitle() {
  console.log(chalk.cyan(figlet.textSync(' DARK LIFE ', { horizontalLayout: 'full' })));
  console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.gray('By HAMAD 🧬 Join Tg - https://t.me/HAMAD_ALPHA'));
  console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

async function sendRandomQuestion(agent) {
  try {
    const randomQuestions = JSON.parse(fs.readFileSync('random_questions.json', 'utf-8'));
    const randomQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];

    const payload = { message: randomQuestion, stream: false };

    for (let retry = 0; retry < 3; retry++) {
      try {
        const response = await axios.post(`https://${agent.toLowerCase().replace('_','-')}.stag-vxzy.zettablock.com/main`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });

        return { question: randomQuestion, response: response.data.choices[0].message };
      } catch (error) {
        console.error(chalk.red(`⚠️ API failed, retrying... (${retry + 1}/3)`));
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 sec retry delay
      }
    }

    console.error(chalk.red('🚨 API failed after 3 retries, skipping this request.'));
    return null;

  } catch (error) {
    console.error(chalk.red('⚠️ Error reading questions:'), error.message);
    return null;
  }
}

async function reportUsage(wallet, options) {
  try {
    const payload = {
      wallet_address: wallet,
      agent_id: options.agent_id,
      request_text: options.question,
      response_text: options.response,
      request_metadata: {}
    };

    await axios.post(`https://quests-usage-dev.prod.zettablock.com/api/report_usage`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(chalk.green('✅ Usage data successfully reported!\n'));
  } catch (error) {
    console.error(chalk.red('⚠️ Failed to report usage:'), error.message);
  }
}

async function main() {
  displayAppTitle();

  if (!fs.existsSync('nano_wallets.txt')) {
    console.error(chalk.red('⚠️ Error: nano_wallets.txt file not found!'));
    return;
  }

  const wallets = fs.readFileSync('nano_wallets.txt', 'utf-8').split('\n').map(addr => addr.trim()).filter(addr => addr);
  if (wallets.length === 0) {
    console.error(chalk.red('⚠️ Error: No wallet addresses found in nano_wallets.txt!'));
    return;
  }

  console.log(chalk.blue(`📌 ${wallets.length} wallet addresses loaded from nano_wallets.txt`));

  for (const wallet of wallets) {
    console.log(chalk.yellow(`\n🚀 Processing wallet: ${wallet}`));

    for (const [agentId, agentName] of Object.entries(agents)) {
      console.log(chalk.magenta(`\n🤖 Using Agent: ${agentName}`));
      console.log(chalk.dim('----------------------------------------'));

      for (let i = 0; i < 23; i++) {
        console.log(chalk.yellow(`🔄 Iteration-${i + 1} for ${wallet}`));

        const nanya = await sendRandomQuestion(agentId);
        if (!nanya) {
          console.log(chalk.red('🚨 Skipping iteration due to API failure.'));
          continue;
        }

        console.log(chalk.cyan('❓ Query:'), chalk.bold(nanya.question));
        console.log(chalk.green('💡 Answer:'), chalk.italic(nanya?.response?.content ?? 'No response received'));

        await reportUsage(wallet.toLowerCase(), {
          agent_id: agentId,
          question: nanya.question,
          response: nanya?.response?.content ?? 'There is no answer'
        });

        if (i < 22) {
          await new Promise(resolve => setTimeout(resolve, 20000)); // 20 sec delay
        }
      }

      console.log(chalk.dim('----------------------------------------'));
    }
  }
  console.log(chalk.green('\n✅ All wallets processed successfully!'));
}

main();
