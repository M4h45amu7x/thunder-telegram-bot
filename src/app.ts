import jsQR from 'jsqr'
import TelegramBot from 'node-telegram-bot-api'
import { z } from 'zod'

import { cooldown, prisma, utils } from '@/libs'

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
})

bot.on('message', async event => {
    try {
        if (event.photo?.length === 2) {
            if (cooldown.checkCooldown(`${event.chat.id}`)) {
                const photo = event.photo[1]

                const qrCode = jsQR(
                    await utils.streamToUint8ClampedArray(bot.getFileStream(photo.file_id)),
                    photo.width,
                    photo.height,
                )
                if (!qrCode) return

                const prefix = z.string().uuid().safeParse(qrCode.data)
                if (!prefix.success) return bot.sendMessage(event.chat.id, '❌ QR Code ไม่ถูกต้อง')

                const service = await prisma.service.findUnique({
                    where: {
                        prefix: prefix.data,
                    },
                    select: {
                        id: true,
                        name: true,
                        property: true,
                    },
                })
                if (!service) return bot.sendMessage(event.chat.id, '❌ ไม่พบบริการนี้')

                await prisma.service.update({
                    where: {
                        id: service.id,
                    },
                    data: {
                        property: {
                            ...(service.property as any),
                            telegram: {
                                bot_token: process.env.BOT_TOKEN,
                                chat_id: `${event.chat.id}`,
                            },
                        },
                    },
                })
                await bot.sendMessage(
                    event.chat.id,
                    `✅ เปิดการใช้งานแจ้งเตือนผ่าน Telegram ของบริการ ${service.name} สำเร็จแล้ว`,
                )
                console.log(`Connected ${service.name} success!`)
            }
        }
    } catch (error) {
        console.error(error)
    }
})

bot.onText(/^\/chatid@thunder_slip_notify_bot$/, event => {
    if (event.chat.type !== 'group' && event.chat.type !== 'supergroup') return

    bot.sendPhoto(event.chat.id, 'https://placehold.co/1920x1080.jpg', {
        parse_mode: 'MarkdownV2',
        caption: `✅ Chat Id ของคุณคือ **\`${event.chat.id}\`**`,
    })
})

bot.onText(/^\/chatid$/, event => {
    if (event.chat.type !== 'private') return

    bot.sendPhoto(event.chat.id, 'https://placehold.co/1920x1080.jpg', {
        parse_mode: 'MarkdownV2',
        caption: `✅ Chat Id ของคุณคือ **\`${event.chat.id}\`**`,
    })
})

bot.on('polling_error', error => {
    console.error(`Polling error: ${error.message}`)
})

console.log('Started Thunder Bot')
