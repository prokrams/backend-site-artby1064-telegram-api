require('dotenv').config()

const express = require('express')
const fetch = require('node-fetch')

const app = express()
const PORT = process.env.PORT || 3000

const cors = require('cors')
app.use(cors({
    origin: 'http://localhost:5173'
    }
))

app.use(express.json())
app.post('/send', async (req, res) => {
    
    const { name, phone, email, budget, desc, checkOptions, checkboxCheck, createAt } = req.body

    if (!name || !phone || !checkboxCheck !== true) {
        return res.status(400).send('Missing fields')
    }

    const safe = (val) => val ? val : '-'
    const options = Array.isArray(checkOptions && checkOptions.length > 0 ? checkOptions.join(', ') : '-'
    const text = `
        Новая заявка с сайта:
        Имя: ${safe(name)}
        Номер: ${safe(phone)}
        Почта: ${safe(email)}
        Бюджет: ${safe(budget)}
        Описание: ${safe(desc)}
        Выбранные опции: ${options} 
        Политика: ${checkboxCheck === true ? 'ДА' : 'НЕТ'}
        Отправлено: ${safe(createAt)}`

    try {
        const telegramRes = await fetch(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            chat_id: process.env.CHAT_ID,
            text,
            parse_mode: 'Markdown'
        }),
        });

        const data = await telegramRes.json()
        if (!data.ok) {
        throw new Error(data.description)
        }

        res.status(200).send('OK')
    } catch (e) {
        console.error(e)
        res.status(500).send('Telegram Error')
    }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
