import logging
import os
import random
import string
from telegram import Update
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext
from dotenv import load_dotenv
from mongodb.database import get_db_collection, delete_old_password, save_new_password, save_access_link
import datetime

# Load environment variables from the .env file
load_dotenv()

# Fetch the bot token from the .env file
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ADMIN_ID = os.getenv("ADMIN_ID")
CHANNEL_ID = os.getenv("CHANNEL_ID")
WEBSITE_URL = os.getenv("WEBSITE_URL")

# Set up logging to track errors or important actions
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to generate a random 4-digit password
def generate_password():
    """Generate a secure, random 4-digit password."""
    return str(random.randint(1000, 9999))  # Generates a 4-digit number

# Function to handle the /start command and send a welcome message
def start(update: Update, context: CallbackContext):
    """Handle the /start command to welcome the user."""
    user = update.message.from_user
    logger.info(f"User {user.first_name} {user.last_name} ({user.id}) started the bot.")
    update.message.reply_text(f"Hello, {user.first_name}! Use /getpassword to receive the current password.")

# Function to handle the /getpassword command to get the current password
def get_password(update: Update, context: CallbackContext):
    """Handle the /getpassword command to fetch the current password."""
    user = update.message.from_user
    # Log the user requesting the password
    logger.info(f"User {user.first_name} ({user.id}) requested the current password.")
    
    db_collection = get_db_collection("passwords")
    current_password_doc = db_collection.find_one({"status": "active"})
    
    if current_password_doc:
        update.message.reply_text(f"The current password is: {current_password_doc['password']}")
    else:
        update.message.reply_text("Sorry, no active password found.")

# Function to handle the /getlink command to generate and send a time-based access link
def get_link(update: Update, context: CallbackContext):
    """Handle the /getlink command to generate and send a time-based access link."""
    user = update.message.from_user
    logger.info(f"User {user.first_name} ({user.id}) requested an access link.")
    
    # Generate a unique access code (hash)
    access_code = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    
    # Create a time-based URL that includes the hash (access code)
    access_link = f"{WEBSITE_URL}?hash={access_code}"

    # Store the generated link in the database with a timestamp of creation
    save_access_link(access_code, datetime.datetime.now())

    # Send the access link to the user
    update.message.reply_text(f"Your access link: {access_link}\nThis link will be valid for 5 minutes.")

# Function to handle the /admin command for admin actions
def admin(update: Update, context: CallbackContext):
    """Handle the /admin command to perform administrative actions."""
    user = update.message.from_user
    if user.id != int(ADMIN_ID):
        update.message.reply_text("You do not have permission to access this command.")
        return

    # Admin action: Generate and send new password
    new_password = generate_password()
    save_new_password(new_password)  # Save the new password to MongoDB
    send_password_to_channel(new_password)

    # Send confirmation to the admin
    update.message.reply_text(f"New password {new_password} generated and sent to the channel.")

# Function to send the new password to the channel
def send_password_to_channel(password: str):
    """Send the newly generated password to the Telegram channel."""
    context.bot.send_message(chat_id=CHANNEL_ID, text=f"New password for the next 24 hours: {password}")

# Function to handle broadcasting messages to all users (for admin)
def broadcast(update: Update, context: CallbackContext):
    """Handle the /broadcast command to send messages to all users."""
    user = update.message.from_user
    if user.id != int(ADMIN_ID):
        update.message.reply_text("You do not have permission to access this command.")
        return
    
    broadcast_message = " ".join(context.args)
    logger.info(f"Admin {user.first_name} sent a broadcast message: {broadcast_message}")

    # Optionally, send the broadcast message to all users stored in the database
    update.message.reply_text(f"Broadcast message: {broadcast_message}")
    # Implement logic to send broadcast message to multiple users here

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
    updater = Updater(TELEGRAM_TOKEN)
    dispatcher = updater.dispatcher

    # Register command handlers
    dispatcher.add_handler(CommandHandler("start", start))  # /start command
    dispatcher.add_handler(CommandHandler("getpassword", get_password))  # /getpassword command
    dispatcher.add_handler(CommandHandler("getlink", get_link))  # /getlink command
    dispatcher.add_handler(CommandHandler("admin", admin))  # /admin command
    dispatcher.add_handler(CommandHandler("broadcast", broadcast))  # /broadcast command
    dispatcher.add_handler(MessageHandler(Filters.command, unknown))  # Unknown commands handler
    dispatcher.add_error_handler(error)  # Error handling

    # Start polling the bot for updates (messages)
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
