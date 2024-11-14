import logging
import os
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from dotenv import load_dotenv
from mongodb.database import get_db_collection  # Assuming you are using MongoDB for storage
import random
import string

# Load environment variables from the .env file
load_dotenv()

# Fetch the bot token from the .env file
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ADMIN_ID = os.getenv("ADMIN_ID")

# Set up logging to track errors or important actions
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to start the bot and send a welcome message
def start(update: Update, context: CallbackContext):
    """Handle the /start command to welcome the user."""
    user = update.message.from_user
    # Log user information
    logger.info(f"User {user.first_name} {user.last_name} ({user.id}) started the bot.")
    update.message.reply_text(f"Hello, {user.first_name}! Welcome to the bot.\nUse /getlink to receive your access link.")

# Function to generate a random 6-character alphanumeric code for the user
def generate_access_code():
    """Generate a secure, random access code consisting of uppercase letters, lowercase letters, and digits."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=6))  # Generates a 6-character code

# Function to handle the /getlink command and send the access link
def get_link(update: Update, context: CallbackContext):
    """Handle the /getlink command to generate and send a time-based access link."""
    user = update.message.from_user
    # Log the user requesting an access link
    logger.info(f"User {user.first_name} ({user.id}) requested an access link.")
    
    # Generate a unique access code for the user
    access_code = generate_access_code()

    # Create a time-based URL that includes the hash (access code)
    website_url = os.getenv("WEBSITE_URL")
    access_link = f"{website_url}?hash={access_code}"

    # Send the access link back to the user
    update.message.reply_text(f"Your access link: {access_link}\nThis link will be valid for 24 hours.")

    # Optional: Store the link in the database for further validation if needed
    # You can store the access code in the MongoDB collection
    db_collection = get_db_collection("access_links")  # Example collection for storing access links
    db_collection.insert_one({"user_id": user.id, "access_code": access_code, "created_at": datetime.datetime.now()})

# Function to handle the /admin command for admin actions
def admin(update: Update, context: CallbackContext):
    """Handle the /admin command to perform administrative actions, such as broadcasting messages."""
    user = update.message.from_user

    # Check if the user is an admin
    if user.id != int(ADMIN_ID):
        update.message.reply_text("You do not have permission to access this command.")
        return
    
    # The next step is to perform the admin action, e.g., broadcast messages to all users
    # For now, let's send a simple message
    update.message.reply_text("Welcome, Admin! Use /broadcast to send a message to all users.")

# Function to handle broadcasting messages to all users
def broadcast(update: Update, context: CallbackContext):
    """Handle the /broadcast command to send messages to all users."""
    user = update.message.from_user

    # Check if the user is an admin
    if user.id != int(ADMIN_ID):
        update.message.reply_text("You do not have permission to access this command.")
        return

    # Get the message to broadcast from the user's text
    broadcast_message = " ".join(context.args)

    # Log the broadcast attempt
    logger.info(f"Admin {user.first_name} sent a broadcast message: {broadcast_message}")

    # Assuming MongoDB or any other database contains a list of users
    # For this example, we're simply broadcasting to the user who requested the message
    # You can expand this part to send the message to a list of user IDs or a group
    update.message.reply_text(f"Broadcasting message to all users: {broadcast_message}")

    # Example: send the broadcast message to all users
    # for user_id in user_list:
    #     context.bot.send_message(chat_id=user_id, text=broadcast_message)

# Function to handle unknown commands
def unknown(update: Update, context: CallbackContext):
    """Handle unknown commands."""
    update.message.reply_text("Sorry, I didn't understand that command.")

# Function to handle errors
def error(update: Update, context: CallbackContext):
    """Handle errors gracefully."""
    logger.warning(f"Update {update} caused error {context.error}")

# Main function to set up and run the Telegram bot
def main():
    """Start the bot and set up the handlers."""
    # Set up the Updater with the bot token
    updater = Updater(TELEGRAM_TOKEN)

    # Get the dispatcher to register handlers
    dispatcher = updater.dispatcher

    # Register command handlers
    dispatcher.add_handler(CommandHandler("start", start))           # /start command
    dispatcher.add_handler(CommandHandler("getlink", get_link))       # /getlink command
    dispatcher.add_handler(CommandHandler("admin", admin))           # /admin command
    dispatcher.add_handler(CommandHandler("broadcast", broadcast))   # /broadcast command
    dispatcher.add_handler(MessageHandler(Filters.command, unknown))  # Unknown commands handler
    dispatcher.add_error_handler(error)  # Error handling

    # Start polling the bot for updates (messages)
    updater.start_polling()

    # Run the bot until you manually stop it
    updater.idle()

if __name__ == '__main__':
    main()
