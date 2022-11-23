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
async function get_retail_sale_admin(id, api_token, start, end){
    let all_sum = 0
    let all_cost = 0
    let all_profit = 0
    let page = 1
    // let date = get_this_month()
    let a = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+start+'&created_at[]='+end)
    let page_count = a.data.count
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
            let b = await axios.get(url+"retail/sales/?token="+api_token+'&warehouse_id='+id+'&created_at[]='+start+'&created_at[]='+ end +"&page="+s)
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
    today.setHours(5, 59, 0, 0)
    today.setDate(new Date().getDate()+1)
    let today_start = new Date()
    today_start.setHours(6, 0, 0, 0)

    let yesterday_start = new Date()
    yesterday_start.setHours(6, 0, 0, 0)
    yesterday_start.setDate(yesterday_start.getDate()-1)
    let yesterday_end = new Date()
    yesterday_end.setHours(5, 59, 0, 0)
    // yesterday_end.setDate(today.getDate()-1)

    let start_this_month = new Date(new Date().setDate(1))
    start_this_month.setHours(6, 0, 0, 0)
    
    let lost_start = new Date(today.getFullYear(), today.getMonth()-1, 2)
    lost_start.setHours(6, 0, 0, 0)
    lost_start.setDate(1)
    let lost_end = new Date(today.getFullYear(), today.getMonth(), 1)
    lost_end.setHours(5, 59, 0, 0)
    return {
            "today_start": today_start.getTime(), 'today': today.getTime(), "today_s_d": formatDate(today_start), "today_e_d": formatDate(today),
            'yesterday_start': yesterday_start.getTime(), 'yesterday_end': yesterday_end.getTime(), "yesterday_s_d": formatDate(yesterday_start),
            "start_this_moth": start_this_month.getTime(), 'end_this_month': today.getTime(), "start_t_m_d": formatDate(start_this_month),
            "lost_start": lost_start.getTime(), 'lost_end': lost_end.getTime(), "lost_s_d": formatDate(lost_start), "lost_e_d": formatDate(lost_end),}
}

// */5 * * * * *
// 0 0 10 * * *
function send_data_every_day(bot, users){
    var job = new CronJob('0 0 10 * * *', async function() {
        const res = await axios.post(url+"token/new?api_key="+api_key)
        let api_token = res.data.token
        let w = await axios.get(url+"warehouse/?token="+api_token)
        let warehouses = w.data.data
        let date = get_this_month()
        setTimeout(() => {
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
                                "\nКитай: " + splitNumber(r.china) +
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
                                    "\nКитай: " + splitNumber(r.china) +
                                    "\nРасходники: " + splitNumber(r.consumables) +
                                    "\nРеинвистиция: " + splitNumber(r.investment),
                                     { parse_mode: 'HTML'}
                                )
                            }) 
                        }
                    }
                    // else if ('director' in users[i]){
                    //     let all_sum1 = 0, all_sum2= 0, all_sum3= 0, all_sum4= 0, all_sum5 = 0
                    //     let all_profit1= 0, all_profit2= 0, all_profit3= 0, all_profit4= 0, all_profit5 = 0
                    //     let china1= 0, china2= 0, china3= 0, china4= 0, china5 = 0
                    //     let all_cost1= 0, all_cost2= 0, all_cost3= 0, all_cost4= 0, all_cost5 = 0
                    //     let consumables1= 0, consumables2= 0, consumables3= 0, consumables4= 0, consumables5 = 0
                    //     let investment1= 0, investment2= 0, investment3= 0, investment4= 0, investment5 = 0
                    //     for (let k of warehouses){
                    //         if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                                
                    //         }else{
                    //             let a = get_retail_sale(k.id, false, true, false, api_token, date)
                    //             if (k.title.includes('АЛА') ||  k.title.includes('Ала')){
                    //                 a.then(r=>{
                    //                     all_sum1 += parseInt(r.all_sum)
                    //                     all_cost1 += parseInt(r.all_cost)
                    //                     all_profit1 += r.all_profit
                    //                     china1 += r.china
                    //                     consumables1+= r.consumables
                    //                     investment1 += r.investment
                    //                 })
                    //             }else if (k.title.includes('Туркестан')){
                    //                 a.then(r=>{
                    //                     all_sum2 += parseInt(r.all_sum)
                    //                     all_cost2 += parseInt(r.all_cost)
                    //                     all_profit2 += r.all_profit
                    //                     china2 += r.china
                    //                     consumables2+= r.consumables
                    //                     investment2 += r.investment
                    //                 })
                    //             }else if(k.title.includes('КЗО')){
                    //                 a.then(r=>{
                    //                     all_sum3 += parseInt(r.all_sum)
                    //                     all_cost3 += parseInt(r.all_cost)
                    //                     all_profit3 += r.all_profit
                    //                     china3 += r.china
                    //                     consumables3+= r.consumables
                    //                     investment3 += r.investment
                    //                 })
                    //             }else if(k.title.includes('ШЫМК')){
                    //                 a.then(r=>{
                    //                     all_sum4 += parseInt(r.all_sum)
                    //                     all_cost4 += parseInt(r.all_cost)
                    //                     all_profit4 += r.all_profit
                    //                     china4 += r.china
                    //                     consumables4 += r.consumables
                    //                     investment4 += r.investment
                    //                 })
                    //             }else if(k.title.includes('Тараз')){
                    //                 a.then(r=>{
                    //                     all_sum5 += parseInt(r.all_sum)
                    //                     all_cost5 += parseInt(r.all_cost)
                    //                     all_profit5 += r.all_profit
                    //                     china5 += r.china
                    //                     consumables5+= r.consumables
                    //                     investment5 += r.investment
                    //                 })
                    //             }
                    //         }
                    //     }
                    //     setTimeout(() => {
                    //         bot.telegram.sendMessage(users[i].uuid,
                    //             "<b><i>Алматы:" + "</i></b>" +'\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                    //             "\nСумма: " + splitNumber(all_sum1) + 
                    //             "\nСебестоимость: " + splitNumber(all_cost1) +
                    //             "\nПрибыль: " + splitNumber(all_profit1)+
                    //             "\nКитай: " + splitNumber(china1) +
                    //             "\nРасходники: " + splitNumber(consumables1) +
                    //             "\nРеинвистиция: " + splitNumber(investment1), 
                    //             { parse_mode: 'HTML'}
                    //         )
                    //         bot.telegram.sendMessage(users[i].uuid,
                    //             "<b><i>Туркестан:" + "</i></b>" +'\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                    //             "\nСумма: " + splitNumber(all_sum2) + 
                    //             "\nСебестоимость: " + splitNumber(all_cost2) +
                    //             "\nПрибыль: " + splitNumber(all_profit2)+
                    //             "\nКитай: " + splitNumber(china2) +
                    //             "\nРасходники: " + splitNumber(consumables2) +
                    //             "\nРеинвистиция: " + splitNumber(investment2), 
                    //             { parse_mode: 'HTML'}
                    //         )  
                    //         bot.telegram.sendMessage(users[i].uuid,
                    //             "<b><i>Кызылорда:" + "</i></b>" +'\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                    //             "\nСумма: " + splitNumber(all_sum3) + 
                    //             "\nСебестоимость: " + splitNumber(all_cost3) +
                    //             "\nПрибыль: " + splitNumber(all_profit3)+
                    //             "\nКитай: " + splitNumber(china3) +
                    //             "\nРасходники: " + splitNumber(consumables3) +
                    //             "\nРеинвистиция: " + splitNumber(investment3), 
                    //             { parse_mode: 'HTML'}
                    //         )  
                    //         bot.telegram.sendMessage(users[i].uuid,
                    //             "<b><i>Шымкент:" + "</i></b>" +'\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                    //             "\nСумма: " + splitNumber(all_sum4) + 
                    //             "\nСебестоимость: " + splitNumber(all_cost4) +
                    //             "\nПрибыль: " + splitNumber(all_profit4)+
                    //             "\nКитай: " + splitNumber(china4) +
                    //             "\nРасходники: " + splitNumber(consumables4) +
                    //             "\nРеинвистиция: " + splitNumber(investment4), 
                    //             { parse_mode: 'HTML'}
                    //         )  
                    //         bot.telegram.sendMessage(users[i].uuid,
                    //             "<b><i>Тараз:" + "</i></b>" +'\n<b><i>' + date.yesterday_s_d + "</i></b>" +
                    //             "\nСумма: " + splitNumber(all_sum5) + 
                    //             "\nСебестоимость: " + splitNumber(all_cost5) +
                    //             "\nПрибыль: " + splitNumber(all_profit5)+
                    //             "\nКитай: " + splitNumber(china5) +
                    //             "\nРасходники: " + splitNumber(consumables5) +
                    //             "\nРеинвистиция: " + splitNumber(investment5), 
                    //             { parse_mode: 'HTML'}
                    //         )  
                    //     }, 4000);
                    // }
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
                                        "\nКитай: " + splitNumber(r.china) +
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
        }, 2000);
    }, null, true);
    job.start();
}

// */5 * * * * *
// 0 0 10 1 */1 *
function send_data_every_month(bot, users){
    var job = new CronJob('0 0 10 1 */1 *', async function() {
        const res = await axios.post(url+"token/new?api_key="+api_key)
        let api_token = res.data.token
        let w = await axios.get(url+"warehouse/?token="+api_token)
        let warehouses = w.data.data
        let date = get_this_month()
        setTimeout(() => {
            for (let i in users){
                if (users[i].uuid !== 0){
                    if (users[i].store_id !== null){
                        let a = get_retail_sale(users[i].store_id, false, false, true, api_token, date)
                        a.then(r=>{
                            bot.telegram.sendMessage(users[i].uuid, 
                                "<b><i>"+ users[i].store_name + "</i></b>" + '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>" +
                                "\nСумма: " + splitNumber(r.all_sum) + 
                                "\nСебестоимость: " + splitNumber(r.all_cost) +
                                "\nПрибыль: " + splitNumber(r.all_profit) +
                                "\nКитай: " + splitNumber(r.china) +
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
                                    "\nКитай: " + splitNumber(r.china) +
                                    "\nРасходники: " + splitNumber(r.consumables) +
                                    "\nРеинвистиция: " + splitNumber(r.investment)
                                    , { parse_mode: 'HTML'}
                                )
                            }) 
                        }
                    }
                    else if ('director' in users[i]){
                        let all_sum1 = 0, all_sum2= 0, all_sum3= 0, all_sum4= 0, all_sum5 = 0
                        let all_profit1= 0, all_profit2= 0, all_profit3= 0, all_profit4= 0, all_profit5 = 0
                        let china1= 0, china2= 0, china3= 0, china4= 0, china5 = 0
                        let all_cost1= 0, all_cost2= 0, all_cost3= 0, all_cost4= 0, all_cost5 = 0
                        let consumables1= 0, consumables2= 0, consumables3= 0, consumables4= 0, consumables5 = 0
                        let investment1= 0, investment2= 0, investment3= 0, investment4= 0, investment5 = 0
                        for (let k of warehouses){
                            if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                                
                            }else{
                                let a = get_retail_sale(k.id, false, false, true, api_token, date)
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
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Алматы:"+  "</i></b>"+ '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum1) + 
                                "\nСебестоимость: " + splitNumber(all_cost1) +
                                "\nПрибыль: " + splitNumber(all_profit1) +
                                "\nКитай: " + splitNumber(china1) +
                                "\nРасходники: " + splitNumber(china1) +
                                "\nРеинвистиция: " + splitNumber(investment1)
                                , { parse_mode: 'HTML'}
                            ) 
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Туркестан:"+  "</i></b>"+ '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum2) + 
                                "\nСебестоимость: " + splitNumber(all_cost2) +
                                "\nПрибыль: " + splitNumber(all_profit2) +
                                "\nКитай: " + splitNumber(china2) +
                                "\nРасходники: " + splitNumber(china2) +
                                "\nРеинвистиция: " + splitNumber(investment2)
                                , { parse_mode: 'HTML'}
                            )
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Кызылорда:"+  "</i></b>"+ '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum3) + 
                                "\nСебестоимость: " + splitNumber(all_cost3) +
                                "\nПрибыль: " + splitNumber(all_profit3) +
                                "\nКитай: " + splitNumber(china3) +
                                "\nРасходники: " + splitNumber(china3) +
                                "\nРеинвистиция: " + splitNumber(investment3)
                                , { parse_mode: 'HTML'}
                            )
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Шымкент:"+  "</i></b>"+ '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum4) + 
                                "\nСебестоимость: " + splitNumber(all_cost4) +
                                "\nПрибыль: " + splitNumber(all_profit4) +
                                "\nКитай: " + splitNumber(china4) +
                                "\nРасходники: " + splitNumber(china4) +
                                "\nРеинвистиция: " + splitNumber(investment4)
                                , { parse_mode: 'HTML'}
                            )
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Тараз:"+  "</i></b>"+ '\n<b><i>' + date.lost_s_d + '-'+ date.lost_e_d + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum5) + 
                                "\nСебестоимость: " + splitNumber(all_cost5) +
                                "\nПрибыль: " + splitNumber(all_profit5) +
                                "\nКитай: " + splitNumber(china5) +
                                "\nРасходники: " + splitNumber(china5) +
                                "\nРеинвистиция: " + splitNumber(investment5)
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
                                        "\nКитай: " + splitNumber(r.china) +
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
        }, 2000);
    }, null, true);
    job.start();
}

// */5 * * * * *
// 0 0 10 */5 * *
function send_data_for_admin(bot, users){
    var job = new CronJob('0 0 10 */5 * *', async function() {
        const res = await axios.post(url+"token/new?api_key="+api_key)
        let api_token = res.data.token
        let w = await axios.get(url+"warehouse/?token="+api_token)
        let warehouses = w.data.data
        let today = new Date()
        today.setHours(5, 59, 0, 0)
        today.setDate(new Date().getDate()+1)
        let start = new Date()
        start.setHours(6, 0, 0, 0)
        let start2 = new Date()
        start2.setDate(start.getDate()-1)
        setTimeout(() => {
            for (let i in users){
                if (users[i].uuid !== 0){
                    if ('director' in users[i]){
                        let all_sum1 = 0, all_sum2= 0, all_sum3= 0, all_sum4= 0, all_sum5 = 0
                        let all_profit1= 0, all_profit2= 0, all_profit3= 0, all_profit4= 0, all_profit5 = 0
                        let china1= 0, china2= 0, china3= 0, china4= 0, china5 = 0
                        let all_cost1= 0, all_cost2= 0, all_cost3= 0, all_cost4= 0, all_cost5 = 0
                        let consumables1= 0, consumables2= 0, consumables3= 0, consumables4= 0, consumables5 = 0
                        let investment1= 0, investment2= 0, investment3= 0, investment4= 0, investment5 = 0
                        for (let d=1; d<=5; d++){
                            start.setDate(start.getDate()-1)
                            today.setDate(today.getDate()-1)
                            for (let k of warehouses){
                                if (k.title == "Склад 2" || k.title == "Склад" || k.title == "Склад товаров"){
                                    
                                }else{
                                    let a = get_retail_sale_admin(k.id, api_token, start.getTime(), today.getTime())
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
                        }
                        setTimeout(() => {
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Алматы:"+ '\n' + formatDate(start)  + '-'+ formatDate(start2) + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum1) + 
                                "\nСебестоимость: " + splitNumber(all_cost1) +
                                "\nПрибыль: " + splitNumber(all_profit1) +
                                "\nКитай: " + splitNumber(china1) +
                                "\nРасходники: " + splitNumber(china1) +
                                "\nРеинвистиция: " + splitNumber(investment1)
                                , { parse_mode: 'HTML'}
                            ) 
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Туркестан:"+ '\n' + formatDate(start)  + '-'+ formatDate(start2) + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum2) + 
                                "\nСебестоимость: " + splitNumber(all_cost2) +
                                "\nПрибыль: " + splitNumber(all_profit2) +
                                "\nКитай: " + splitNumber(china2) +
                                "\nРасходники: " + splitNumber(china2) +
                                "\nРеинвистиция: " + splitNumber(investment2)
                                , { parse_mode: 'HTML'}
                            )
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Кызылорда:"+ '\n' + formatDate(start)  + '-'+ formatDate(start2) + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum3) + 
                                "\nСебестоимость: " + splitNumber(all_cost3) +
                                "\nПрибыль: " + splitNumber(all_profit3) +
                                "\nКитай: " + splitNumber(china3) +
                                "\nРасходники: " + splitNumber(china3) +
                                "\nРеинвистиция: " + splitNumber(investment3)
                                , { parse_mode: 'HTML'}
                            )
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Шымкент:"+ '\n' + formatDate(start)  + '-'+ formatDate(start2) + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum4) + 
                                "\nСебестоимость: " + splitNumber(all_cost4) +
                                "\nПрибыль: " + splitNumber(all_profit4) +
                                "\nКитай: " + splitNumber(china4) +
                                "\nРасходники: " + splitNumber(china4) +
                                "\nРеинвистиция: " + splitNumber(investment4)
                                , { parse_mode: 'HTML'}
                            )
                            bot.telegram.sendMessage(users[i].uuid,
                                "<b><i>Тараз:"+ '\n' + formatDate(start)  + '-'+ formatDate(start2) + "</i></b>"+
                                "\nСумма: " + splitNumber(all_sum5) + 
                                "\nСебестоимость: " + splitNumber(all_cost5) +
                                "\nПрибыль: " + splitNumber(all_profit5) +
                                "\nКитай: " + splitNumber(china5) +
                                "\nРасходники: " + splitNumber(china5) +
                                "\nРеинвистиция: " + splitNumber(investment5)
                                , { parse_mode: 'HTML'}
                            )  
                        }, 6000);
                    }
                }
            }
        }, 2000);
    }, null, true);
    job.start();
}

module.exports = {
    get_this_month,
    get_retail_sale,
    send_data_every_day,
    send_data_every_month,
    splitNumber,
    send_data_for_admin
}