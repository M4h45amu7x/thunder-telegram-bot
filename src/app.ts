import jsQR from 'jsqr'
import TelegramBot from 'node-telegram-bot-api'
import { z } from 'zod'

import { cooldown, prisma, utils } from '@/libs'

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true,
    request: {
        url: 'https://api.telegram.org',
        agentOptions: {
            keepAlive: true,
            family: 4,
        },
    },
})

bot.on('chat_join_request', event => {
    bot.sendMessage(event.chat.id, 'test')
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
            }
        }
    } catch (error) {
        console.error(error)
    }
})

console.log('Started Thunder Bot')
