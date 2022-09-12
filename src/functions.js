const axios = require('axios');
// const cron = require('node-cron');
const url = "https://api.remonline.app/"
const api_key = "c4251a604e674ba3936f2bee026e9113"
const CronJob = require('cron').CronJob


function splitNumber(value) { 
    const val = Number(value.toFixed(2)).toString() 
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
} 

function formatDate(value) { 
    return `${('0' + value.getDate()).slice(-2)}.${('0' + (value.getMonth()+1)).slice(-2)}.${value.getFullYear()}`
} 

async function get_retail_sale(id, istoday, every_day, every_month, api_token, date){
    let all_sum = 0
    let all_cost = 0
    let all_profit = 0
    let page = 1
    // let date = get_this_month()
    let a
    if (every_month){
        a = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+date.lost_start+'&created_at[]='+ date.lost_end)
    }else if (istoday){
        a = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+date.today_start+'&created_at[]='+date.today)
    }else if(every_day){
        a = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+date.yesterday_start+'&created_at[]='+date.yesterday_end)
    }
    let page_count = a.data.count
    // console.log(page_count)
    let p = page_count / 50
    if (p > Math.floor(p)){
        page = Math.floor(p)+1
    }else{
        page = p
    }
    const d = a.data.data
    for (let i of d){
        let i_sum = 0
        let i_cost = 0
        for (let k of i.products){
            let summa = k.price * k.amount
            i_sum += summa
            i_cost += k.cost
        }
        all_sum += i_sum
        all_cost += i_cost
    }
    if (page > 1){
        for (let s = 2; s<=page; s++){
            let b
            if (every_month){
                b = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+date.lost_start+'&created_at[]='+ date.lost_end+"&page="+s)
            }else if (istoday){
                b = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+date.today_start+'&created_at[]='+date.today+"&page="+s)
            }else if(every_day){
                b = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+date.yesterday_start+'&created_at[]='+date.yesterday_end+"&page="+s)
            }
            const d = b.data.data
            for (let i of d){
                let i_sum = 0
                let i_cost = 0
                for (let k of i.products){
                    let summa = k.price * k.amount
                    i_sum += summa
                    i_cost += k.cost
                }
                all_sum += i_sum
                all_cost += i_cost
            }                
        }
    }
    all_profit = all_sum-all_cost
    return {
            "all_sum": all_sum, "all_cost": all_cost, "all_profit": all_profit, 
            "china": (all_cost/2), "consumables": (all_cost/2),
            "investment": (all_profit * 0.15)
    }
}


function get_this_month(){
    let today = new Date()
    today.setHours(23, 59, 0, 0)
    today.setDate(new Date().getDate())
    let today_start = new Date()
    today_start.setHours(0, 0, 0, 0)
    console.log(today_start, today, today_start.getTime(), today.getTime())

    let yesterday_start = new Date()
    yesterday_start.setHours(0, 0, 0, 0)
    yesterday_start.setDate(yesterday_start.getDate()-1)
    let yesterday_end = new Date()
    yesterday_end.setHours(23, 59, 0, 0)
    yesterday_end.setDate(today.getDate()-1)
    console.log(yesterday_start, yesterday_end, yesterday_start.getTime(), yesterday_end.getTime())

    let start_this_month = new Date(new Date().setDate(1))
    start_this_month.setHours(0, 0, 0, 0)
    console.log(start_this_month, today, start_this_month.getTime(), today.getTime())
    
    let lost_start = new Date(today.getFullYear(), today.getMonth()-1, 2)
    lost_start.setHours(0, 0, 0, 0)
    lost_start.setDate(1)
    let lost_end = new Date(today.getFullYear(), today.getMonth(), 0)
    lost_end.setHours(23, 59, 0, 0)
    console.log(lost_start, lost_end, lost_start.getTime(), lost_end.getTime())
    return {
            "today_start": today_start.getTime(), 'today': today.getTime(), "today_s_d": formatDate(today_start), "today_e_d": formatDate(today),
            'yesterday_start': yesterday_start.getTime(), 'yesterday_end': yesterday_end.getTime(), "yesterday_s_d": formatDate(yesterday_start),
            "start_this_moth": start_this_month.getTime(), 'end_this_month': today.getTime(), "start_t_m_d": formatDate(start_this_month),
            "lost_start": lost_start.getTime(), 'lost_end': lost_end.getTime(), "lost_s_d": formatDate(lost_start), "lost_e_d": formatDate(lost_end),}
}

// */5 * * * * *
// 0 10 * * *
function send_data_every_day(bot, users){
    var job = new CronJob('0 10 * * *', async function() {
        const res = await axios.post(url+"token/new?api_key="+api_key)
        let api_token = res.data.token
        let w = await axios.get(url+"warehouse/?token="+api_token)
        let warehouses = w.data.data
        let date = get_this_month()
        for (let i in users){
            if (users[i].uuid !== 0){
                if (users[i].store_id !== null){
                    let a = get_retail_sale(users[i].store_id, false, true, false, api_token, date)
                    a.then(r=>{
                        bot.telegram.sendMessage(users[i].uuid, 
                            "<b><i>"+ users[i].store_name + '\n' + date.yesterday_s_d + "</i></b>" +
                            "\nСумма: " + splitNumber(r.all_sum) + 
                            "\nСебестоимость: " + splitNumber(r.all_cost) +
                            "\nПрибыль: " + splitNumber(r.all_profit) +
                            "\nСебестоимость: " + splitNumber(r.china) +
                            "\nРасходники: " + splitNumber(r.consumables) +
                            "\nРеинвистиция: " + splitNumber(r.investment),
                            { parse_mode: 'HTML'}
                        )
                    }) 
                }
                else if ('stores' in users[i]){
                    for (let k in users[i].stores){
                        let a = get_retail_sale(users[i].stores[k], false, true, false, api_token, date)
                        a.then(r=>{
                            bot.telegram.sendMessage(users[i].uuid, 
                                "<b><i>"+ users[i].store_names[k] +'\n' + date.yesterday_s_d + "</i></b>" +
                                "\nСумма: " + splitNumber(r.all_sum) + 
                                "\nСебестоимость: " + splitNumber(r.all_cost) +
                                "\nПрибыль: " + splitNumber(r.all_profit) +
                                "\nСебестоимость: " + splitNumber(r.china) +
                                "\nРасходники: " + splitNumber(r.consumables) +
                                "\nРеинвистиция: " + splitNumber(r.investment),
                                 { parse_mode: 'HTML'}
                            )
                        }) 
                    }
                }
                else if ('director' in users[i]){
                    let all_sum = 0
                    let all_cost = 0 
                    let all_profit = 0
                    let china = 0
                    let consumables =0
                    let investment = 0
                    for (let k of warehouses){
                        if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                            
                        }else{
                            let a = get_retail_sale(k.id, false, true, false, api_token, date)
                            a.then(r=>{
                                all_sum += r.all_sum
                                all_cost += r.all_cost
                                all_profit += r.all_profit
                                china += r.china
                                consumables+= r.consumables
                                investment += r.investment
                            })
                        }
                    }
                    setTimeout(() => {
                        bot.telegram.sendMessage(users[i].uuid,
                            "<b><i>Все точки:" + "</i></b>" +'\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                            "\nСумма: " + splitNumber(all_sum) + 
                            "\nСебестоимость: " + splitNumber(all_cost) +
                            "\nПрибыль: " + splitNumber(all_profit)+
                            "\nСебестоимость: " + splitNumber(china) +
                            "\nРасходники: " + splitNumber(consumables) +
                            "\nРеинвистиция: " + splitNumber(investment), 
                            { parse_mode: 'HTML'}
                        )   
                    }, 3000);
                }
                else if ('booker' in users[i]){
                    for (let k of warehouses){
                        if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                            
                        }else{
                            let a = get_retail_sale(k.id, false, true, false, api_token, date)
                            a.then(r=>{
                                bot.telegram.sendMessage(users[i].uuid,
                                    "<b><i>"+ k.title + "</i></b>" + '\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                                    "\nСумма: " + splitNumber(r.all_sum) + 
                                    "\nСебестоимость: " + splitNumber(r.all_cost) +
                                    "\nПрибыль: " + splitNumber(r.all_profit) +
                                    "\nСебестоимость: " + splitNumber(r.china) +
                                    "\nРасходники: " + splitNumber(r.consumables) +
                                    "\nРеинвистиция: " + splitNumber(r.investment), 
                                    { parse_mode: 'HTML'}
                                )   
                            })
                        }
                    }
                }
            }
        }
    }, null, true);
    job.start();
}

// */5 * * * * *
// 0 10 * */1 *
function send_data_every_month(bot, users){
    var job = new CronJob('0 10 * */1 *', async function() {
        const res = await axios.post(url+"token/new?api_key="+api_key)
        let api_token = res.data.token
        console.log(api_token)
        let w = await axios.get(url+"warehouse/?token="+api_token)
        let warehouses = w.data.data
        let date = get_this_month()
        for (let i in users){
            if (users[i].uuid !== 0){
                if (users[i].store_id !== null){
                    console.log(api_token, users[i].uuid)
                    let a = get_retail_sale(users[i].store_id, false, false, true, api_token, date)
                    a.then(r=>{
                        bot.telegram.sendMessage(users[i].uuid, 
                            "<b><i>"+ users[i].store_name + "</i></b>" + '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>" +
                            "\nСумма: " + splitNumber(r.all_sum) + 
                            "\nСебестоимость: " + splitNumber(r.all_cost) +
                            "\nПрибыль: " + splitNumber(r.all_profit) +
                            "\nСебестоимость: " + splitNumber(r.china) +
                            "\nРасходники: " + splitNumber(r.consumables) +
                            "\nРеинвистиция: " + splitNumber(r.investment)
                            , { parse_mode: 'HTML'}
                        )
                    }) 
                }
                else if ('stores' in users[i]){
                    for (let k in users[i].stores){
                        let a = get_retail_sale(users[i].stores[k], false, false, true, api_token, date)
                        a.then(r=>{
                            bot.telegram.sendMessage(users[i].uuid, 
                                "<b><i>"+ users[i].store_names[k] + "</i></b>" + '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>" +
                                "\nСумма: " + splitNumber(r.all_sum) + 
                                "\nСебестоимость: " + splitNumber(r.all_cost) +
                                "\nПрибыль: " + splitNumber(r.all_profit) +
                                "\nСебестоимость: " + splitNumber(r.china) +
                                "\nРасходники: " + splitNumber(r.consumables) +
                                "\nРеинвистиция: " + splitNumber(r.investment)
                                , { parse_mode: 'HTML'}
                            )
                        }) 
                    }
                }
                else if ('director' in users[i]){
                    let all_sum = 0
                    let all_cost = 0 
                    let all_profit = 0
                    let china = 0
                    let investment = 0
                    for (let k of warehouses){
                        if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                            
                        }else{
                            let a = get_retail_sale(k.id, false, false, true, api_token, date)
                            a.then(r=>{
                                all_sum += r.all_sum
                                all_cost += r.all_cost
                                all_profit += r.all_profit
                                china += r.china
                                investment += r.investment
                                // console.log(all_sum, r.all_sum)
                            })
                        }
                    }
                    setTimeout(() => {
                        bot.telegram.sendMessage(users[i].uuid,
                            "<b><i>Все точки:"+  "</i></b>"+ '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>"+
                            "\nСумма: " + splitNumber(all_sum) + 
                            "\nСебестоимость: " + splitNumber(all_cost) +
                            "\nПрибыль: " + splitNumber(all_profit) +
                            "\nСебестоимость: " + splitNumber(china) +
                            "\nРасходники: " + splitNumber(china) +
                            "\nРеинвистиция: " + splitNumber(investment)
                            , { parse_mode: 'HTML'}
                        )   
                    }, 4500);
                }
                else if ('booker' in users[i]){
                    for (let k of warehouses){
                        if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                            
                        }else{
                            let a = get_retail_sale(k.id, false, false, true, api_token, date)
                            a.then(r=>{
                                bot.telegram.sendMessage(users[i].uuid,
                                    "<b><i>"+ k.title + "</i></b>" + '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>" +
                                    "\nСумма: " + splitNumber(r.all_sum)  + 
                                    "\nСебестоимость: " + splitNumber(r.all_cost) +
                                    "\nПрибыль: " + splitNumber(r.all_profit) +
                                    "\nСебестоимость: " + splitNumber(r.china) +
                                    "\nРасходники: " + splitNumber(r.consumables) +
                                    "\nРеинвистиция: " + splitNumber(r.investment)
                                    , { parse_mode: 'HTML'}
                                )   
                            })
                        }
                    }
                }
            }
        }
    }, null, true);
    job.start();
}

module.exports = {
    get_this_month,
    get_retail_sale,
    send_data_every_day,
    send_data_every_month,
    splitNumber
}