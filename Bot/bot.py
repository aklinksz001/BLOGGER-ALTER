import database
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext

def start(update: Update, context: CallbackContext) -> None:
    """Send a math problem to the user."""
    import random
    num1 = random.randint(1, 20)
    num2 = random.randint(1, 20)
    answer = num1 + num2
    context.user_data['answer'] = answer
    update.message.reply_text(f"Solve this: {num1} + {num2} = ?")

def check_answer(update: Update, context: CallbackContext) -> None:
    """Check the user's answer and generate a key if correct."""
    user_answer = update.message.text.strip()

    if user_answer.isdigit() and int(user_answer) == context.user_data.get('answer'):
        key = database.store_key()
        update.message.reply_text(f"✅ Correct! Here is your key link: https://yourwebsite.com/home?key={key}")
    else:
        update.message.reply_text("❌ Incorrect. Try again!")

def main():
    """Start the bot."""
    updater = Updater(os.getenv("TELEGRAM_BOT_TOKEN"))
    dispatcher = updater.dispatcher

    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, check_answer))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
