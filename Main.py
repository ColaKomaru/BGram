import telebot
import os

TOKEN = os.environ.get("7988875247:AAG9Ds_jJNZPhpyJ_0yR0pEWmQGa7Q7CPxI")
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id, "Можете отправить ссылку и пожалуйста подпишитесь на тг канал t.me/Krn1_scripts")

bot.polling(non_stop=True)
