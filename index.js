require('dotenv').config()

const express = require('express')
const axios = require('axios')

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

    if (!name || !phone || checkboxCheck !== true) {
        console.log('name:', name)
        console.log('phone:', phone)
        console.log('checkboxCheck:', checkboxCheck, typeof checkboxCheck)
        return res.status(400).send('Missing fields')
    }
    
    const safe = (val) => val ? val : '-'
    const options = Array.isArray(checkOptions) && checkOptions.length > 0 ? checkOptions.join(', ') : '-'
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
    console.log('send:');
    console.log(text);

    try {
        const telegramRes = await axios.post(
        `https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`,
        {
            chat_id: process.env.CHAT_ID,
            text,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )

        const data = telegramRes.data
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
