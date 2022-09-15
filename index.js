const { Telegraf, Markup, Extra } = require('telegraf')
const axios = require('axios');
// const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');

var token = '5378018696:AAH2VEeuMbZf6HB6XXJuZJZuzvSzgU-Rds0';
const bot = new Telegraf(token)

// var db = new sqlite3.Database('sqlite.db');
const fs = require('fs'); 
let rawdata = fs.readFileSync('user.json'); 
let users = JSON.parse(rawdata); 

const api_key = "c4251a604e674ba3936f2bee026e9113"
let api_token = ""
const url = "https://api.remonline.app/"
let warehouses = []

const { 
    get_retail_sale,
    send_data_every_day,
    send_data_every_month,
    get_this_month, 
    splitNumber
  } = require("./src/functions")

// auth()

bot.start((ctx) => {
    auth()
    ctx.replyWithHTML("<b><i>Введите номер телефона. \nПример: 87771234567 </i></b>")
})

bot.on('message', async (ctx)=>{
    let txt = ctx.message.text
    let date = get_this_month()
    if (/^[\d.,:]*$/.test(txt)){
        for (let l in users){
            if (users[l].uuid == ctx.chat.id){
                if ('director' in users[l]){

                }else if ('booker' in users[l]){

                }else if ('87006008682' == l){

                }else{
                    ctx.reply('Вы уже зарегистрировали номер ' + [l])
                    return
                }
            }
        }
        try{
            let res = await axios.get(url+"warehouse/?token="+api_token)
        }
        catch(e){
            let aut = await axios.post(url+"token/new?api_key="+api_key)
            api_token = aut.data.token
            let wh = await axios.get(url+"warehouse/?token="+api_token)
            warehouses = wh.data.data
            console.log(api_token)
        }
        if (txt in users){
            if ("booker" in users[txt]){  // booker
                for (let k of warehouses){
                    if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                        
                    }else{
                        let a = get_retail_sale(k.id, true, false, false, api_token, date)
                        a.then(r=>{
                            ctx.replyWithHTML(
                                "<b><i>"+ k.title + '\n' + date.today_s_d + "</i></b>"  +
                                "\nСумма: " + splitNumber(r.all_sum)  + 
                                "\nСебестоимость: " + splitNumber(r.all_cost) +
                                "\nПрибыль: " + splitNumber(r.all_profit)+
                                "\nКитай: " + splitNumber(r.china) +
                                "\nРасходники: " + splitNumber(r.consumables) +
                                "\nРеинвистиция: " + splitNumber(r.investment)
                            )   
                        })
                    }
                }
                
            }else if ("director" in users[txt]){ // director
                let all_sum1 = 0, all_sum2= 0, all_sum3= 0, all_sum4= 0, all_sum5 = 0
                let all_profit1= 0, all_profit2= 0, all_profit3= 0, all_profit4= 0, all_profit5 = 0
                let china1= 0, china2= 0, china3= 0, china4= 0, china5 = 0
                let all_cost1= 0, all_cost2= 0, all_cost3= 0, all_cost4= 0, all_cost5 = 0
                let consumables1= 0, consumables2= 0, consumables3= 0, consumables4= 0, consumables5 = 0
                let investment1= 0, investment2= 0, investment3= 0, investment4= 0, investment5 = 0
                for (let k of warehouses){
                    if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                        
                    }else{
                        let a = get_retail_sale(k.id, true, false, false, api_token, date)
                        if (k.title.includes('АЛА') ||  k.title.includes('Ала')){
                            a.then(r=>{
                                all_sum1 += parseInt(r.all_sum)
                                all_cost1 += parseInt(r.all_cost)
                                all_profit1 += r.all_profit
                                china1 += r.china
                                consumables1+= r.consumables
                                investment1 += r.investment
                            })
                        }else if (k.title.includes('Туркестан')){
                            a.then(r=>{
                                all_sum2 += parseInt(r.all_sum)
                                all_cost2 += parseInt(r.all_cost)
                                all_profit2 += r.all_profit
                                china2 += r.china
                                consumables2+= r.consumables
                                investment2 += r.investment
                            })
                        }else if(k.title.includes('КЗО')){
                            a.then(r=>{
                                all_sum3 += parseInt(r.all_sum)
                                all_cost3 += parseInt(r.all_cost)
                                all_profit3 += r.all_profit
                                china3 += r.china
                                consumables3+= r.consumables
                                investment3 += r.investment
                            })
                        }else if(k.title.includes('ШЫМК')){
                            a.then(r=>{
                                all_sum4 += parseInt(r.all_sum)
                                all_cost4 += parseInt(r.all_cost)
                                all_profit4 += r.all_profit
                                china4 += r.china
                                consumables4 += r.consumables
                                investment4 += r.investment
                            })
                        }else if(k.title.includes('Тараз')){
                            a.then(r=>{
                                all_sum5 += parseInt(r.all_sum)
                                all_cost5 += parseInt(r.all_cost)
                                all_profit5 += r.all_profit
                                china5 += r.china
                                consumables5+= r.consumables
                                investment5 += r.investment
                            })
                        }
                        
                    }
                }
                setTimeout(() => {
                    ctx.replyWithHTML(
                        "<b><i>Алматы: "+ '\n' + date.today_s_d + "</i></b>"+
                        "\nСумма: " + splitNumber(all_sum1) + 
                        "\nСебестоимость: " + splitNumber(all_cost1) +
                        "\nПрибыль: " + splitNumber(all_profit1)+
                        "\nКитай: " + splitNumber(china1) +
                        "\nРасходники: " + splitNumber(consumables1) +
                        "\nРеинвистиция: " + splitNumber(investment1)
                    )
                    ctx.replyWithHTML(
                        "<b><i>Туркестан: "+ '\n' + date.today_s_d + "</i></b>"+
                        "\nСумма: " + splitNumber(all_sum2) + 
                        "\nСебестоимость: " + splitNumber(all_cost2) +
                        "\nПрибыль: " + splitNumber(all_profit2)+
                        "\nКитай: " + splitNumber(china2) +
                        "\nРасходники: " + splitNumber(consumables2) +
                        "\nРеинвистиция: " + splitNumber(investment2)
                    )
                    ctx.replyWithHTML(
                        "<b><i>Кызылорда: "+ '\n' + date.today_s_d + "</i></b>"+
                        "\nСумма: " + splitNumber(all_sum3) + 
                        "\nСебестоимость: " + splitNumber(all_cost3) +
                        "\nПрибыль: " + splitNumber(all_profit3)+
                        "\nКитай: " + splitNumber(china3) +
                        "\nРасходники: " + splitNumber(consumables3) +
                        "\nРеинвистиция: " + splitNumber(investment3)
                    )
                    ctx.replyWithHTML(
                        "<b><i>Шымкент: "+ '\n' + date.today_s_d + "</i></b>"+
                        "\nСумма: " + splitNumber(all_sum4) + 
                        "\nСебестоимость: " + splitNumber(all_cost4) +
                        "\nПрибыль: " + splitNumber(all_profit4)+
                        "\nКитай: " + splitNumber(china4) +
                        "\nРасходники: " + splitNumber(consumables4) +
                        "\nРеинвистиция: " + splitNumber(investment4)
                    )
                    ctx.replyWithHTML(
                        "<b><i>Тараз: "+ '\n' + date.today_s_d + "</i></b>"+
                        "\nСумма: " + splitNumber(all_sum5) + 
                        "\nСебестоимость: " + splitNumber(all_cost5) +
                        "\nПрибыль: " + splitNumber(all_profit5)+
                        "\nКитай: " + splitNumber(china5) +
                        "\nРасходники: " + splitNumber(consumables5) +
                        "\nРеинвистиция: " + splitNumber(investment5)
                    )
                }, 3000);

            }else if("stores" in users[txt]){  // curator
                let stores = users[txt]['stores']
                let store_names = []
                // console.log(stores)
                if (users[txt].store_names.length == 0){
                    for (let n of stores){
                        for (let i of warehouses){
                            if(i.id == n){
                                store_names.push(i.title)
                            }
                        }
                    }
                    users[txt].store_names = store_names
                    fs.writeFileSync('user.json', JSON.stringify(users));
                }else{
                    store_names = users[txt].store_names
                }
                for (let k in stores){
                    const a = get_retail_sale(stores[k], true, false, false, api_token, date)
                    a.then(r=>{
                        ctx.replyWithHTML(
                            "<b><i>"+ store_names[k] +'\n' + date.today_s_d + "</i></b>" +
                            "\nСумма: " + splitNumber(r.all_sum) + 
                            "\nСебестоимость: " + splitNumber(r.all_cost) +
                            "\nПрибыль: " + splitNumber(r.all_profit)+
                            "\nКитай: " + splitNumber(r.china) +
                            "\nРасходники: " + splitNumber(r.consumables) +
                            "\nРеинвистиция: " + splitNumber(r.investment)
                        )   
                    })
                }                
            }else{
                let store_id = users[txt]['store_id']
                let store_name = ''
                if (users[txt].store_name == ""){
                    for (let k of warehouses){
                        if (k.id == store_id){
                            store_name = k.title
                        }
                    }
                    users[txt].store_name = store_name
                    fs.writeFileSync('user.json', JSON.stringify(users));
                }else{
                    store_name = users[txt].store_name
                }
                let a = get_retail_sale(store_id, true, false, false, api_token, date)
                a.then(r=>{
                    ctx.replyWithHTML(
                        "<b><i>"+ store_name +'\n' + date.today_s_d + "</i></b>" +
                        "\nСумма: " + splitNumber(r.all_sum) + 
                        "\nСебестоимость: " + splitNumber(r.all_cost) +
                        "\nПрибыль: " + splitNumber(r.all_profit)+
                        "\nКитай: " + splitNumber(r.china) +
                        "\nРасходники: " + splitNumber(r.consumables) +
                        "\nРеинвистиция: " + splitNumber(r.investment)
                    )
                })
            }      
            if (users[txt]['uuid'] == 0){
                if ("director" in users[txt]){
                    if (users[txt].uuid != 0){

                    }else{
                        users[txt]['uuid'] = ctx.chat.id
                        fs.writeFileSync('user.json', JSON.stringify(users));
                    }
                }else if ("booker" in users[txt]){
                    if (users[txt].uuid != 0){

                    }else{
                        users[txt]['uuid'] = ctx.chat.id
                        fs.writeFileSync('user.json', JSON.stringify(users));
                    }
                }else if (users["87006008682"].uuid == ctx.chat.id){
                    
                }else{
                    users[txt]['uuid'] = ctx.chat.id
                    fs.writeFileSync('user.json', JSON.stringify(users));
                }
            }      
        }else{
            ctx.reply('User not found')
        }
    }else{
        ctx.reply('not valid')
    }
})


function auth(){
    axios.post(url+"token/new?api_key="+api_key)
        .then(r=>{
            api_token = r.data.token
            console.log(api_token)
            get_warehouse()
        }, r=> {
            console.log(r.error)
        })    
}


function get_warehouse(){
    axios.get(url+"warehouse/?token="+api_token)
        .then(r => {
            warehouses = r.data.data
        }, e => {
            console.log(e)
        })    
}


bot.launch()
send_data_every_day(bot, users)
send_data_every_month(bot, users)