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
                                "\RКитай: " + splitNumber(r.china) +
                                "\nРасходники: " + splitNumber(r.consumables) +
                                "\nРеинвистиция: " + splitNumber(r.investment)
                            )   
                        })
                    }
                }
                
            }else if ("director" in users[txt]){ // director
                let all_sum = 0
                let all_cost = 0
                let all_profit = 0
                let china = 0
                let consumables =0
                let investment = 0
                for (let k of warehouses){
                    if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                        
                    }else{
                        let a = get_retail_sale(k.id, true, false, false, api_token, date)
                        a.then(r=>{
                            all_sum += parseInt(r.all_sum)
                            all_cost += parseInt(r.all_cost)
                            all_profit += r.all_profit
                            china += r.china
                            consumables+= r.consumables
                            investment += r.investment
                        })
                    }
                }
                setTimeout(() => {
                    ctx.replyWithHTML(
                        "<b><i>Все точки: "+ '\n' + date.today_s_d + "</i></b>"+
                        "\nСумма: " + splitNumber(all_sum) + 
                        "\nСебестоимость: " + splitNumber(all_cost) +
                        "\nПрибыль: " + splitNumber(all_profit)+
                        "\RКитай: " + splitNumber(china) +
                        "\nРасходники: " + splitNumber(consumables) +
                        "\nРеинвистиция: " + splitNumber(investment)
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
                            "\RКитай: " + splitNumber(r.china) +
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
                        "\RКитай: " + splitNumber(r.china) +
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
// send_data_every_day(bot, users)
send_data_every_month(bot, users)