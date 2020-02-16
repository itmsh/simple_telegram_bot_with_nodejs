import * as express from 'express'
import * as TelegramBot from 'node-telegram-bot-api'
import { Request, Response } from 'express'
import IControllerTelegram from 'interfaces/IControllerTelegram.interface'
import { start } from 'repl'
import User from '../schemas/user';

class TelegramController implements IControllerTelegram {
    public router = express.Router()
    public bot_token = '291708586:AAGTuBp5velo98DakbSwIOBDrjrap0zyK8s'

    constructor() {
        this.initBot()
    }

    public initBot() {
        const bot = new TelegramBot(this.bot_token, {polling: true});
        const $this = this;

        bot.on('message', (msg) => {
            const chatId = msg.chat.id;

            $this.findOneOrCreate({'chatId':chatId}, function(err, result) {
                let userCurrentStatus = result.userNextStatus || 'start';
                let userPreStatus = result.userCurrentStatus;
                if (msg.text == 'شروع مجدد') {
                    userCurrentStatus = 'start';
                    userPreStatus = null;
                }
                let flowState = $this.flow[userCurrentStatus];
                result.userNextStatus = flowState.exit;
                if (userPreStatus) {
                    result[userPreStatus] = msg.text;
                }
                result.userCurrentStatus = userCurrentStatus;
                result.save((error, doc) => {
                    if (error){
                        // console.log(error.errors);
                        bot.sendMessage(msg.chat.id, 'مقدار وارد شده صحیح نیست');
                        if (userPreStatus) {
                            flowState = $this.flow[userPreStatus];
                        }
                    }
                    let opts = {};
                    let keyboard = [['شروع مجدد']];
                    if (flowState.keyboard) {
                        keyboard = JSON.parse(JSON.stringify(flowState.keyboard));
                        keyboard.push(['شروع مجدد']);
                    }
                    opts = {
                        reply_to_message_id: msg.message_id,
                        reply_markup: JSON.stringify({
                            keyboard: keyboard,
                            one_time_keyboard: true
                        })
                    };
                    bot.sendMessage(msg.chat.id, flowState.onEnterSay, opts);
                });
            });

        });
    }

    public findOneOrCreate(condition, callback) {
        const model = User
        model.findOne(condition, (err, result) => {
            return result ? callback(err, result) : model.create(condition, (err, result) => { return callback(err, result) })
        })
    }

    public flow = {
        'start': {
            onEnterSay: 'سلام من بات آدرسم برای ادامه start رو بزنید',
            exit: 'chooseLocation',
            keyboard: [
                ['شروع']
            ]
        },
        'chooseLocation': {
            onEnterSay: 'محله ای که به دنبال خانه اید را وارد کنید',
            exit: 'rahn',
            keyboard: [
                ['جردن'],
                ['نیاوران'],
                ['فردوسی']
            ]
        },
        'rahn': {
            onEnterSay: 'حداکثر رهن را انتخاب کنید یا وارد کنید',
            exit: 'ejare',
            keyboard: [
                ['10000000'],
                ['20000000'],
                ['30000000']
            ]
        },
        'ejare': {
            onEnterSay: 'حداکثر اجاره را انتخاب یا وارد کنید',
            exit: 'bedroom_count',
            keyboard: [
                ['1000000'],
                ['2000000'],
                ['3000000']
            ]
        },
        'bedroom_count': {
            onEnterSay: 'تعداد اتاق خواب را انتخاب کنید',
            exit: 'enter_phone_number',
            keyboard: [
                ['1', '2'],
                ['3', '4']
            ]
        },
        'enter_phone_number': {
            onEnterSay: 'شماره همراه خود را وارد کنید',
            exit: 'thank_you'
        },
        'thank_you': {
            onEnterSay: 'اطلاعات شما با موفقیت ثبت شد. آیا ادامه میدهید؟',
            exit: 'start',
        }
    }
}

export default TelegramController
