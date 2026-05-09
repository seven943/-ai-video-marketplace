import { Injectable } from '@nestjs/common';

interface FilterResult {
  filtered: string;
  blocked: boolean;
  reason?: string;
}

@Injectable()
export class ContentFilterService {
  private readonly sensitivePatterns: { pattern: RegExp; reason: string }[] = [
    // 手机号
    { pattern: /1[3-9]\d{9}/g, reason: '包含手机号' },
    { pattern: /1[3-9]\s?\d{4}\s?\d{4}/g, reason: '包含手机号' },
    // 微信号
    { pattern: /(微信|wechat|wx|weixin)[\s:：]*[a-zA-Z0-9_]{5,}/gi, reason: '包含微信号' },
    { pattern: /加我[微信微]/g, reason: '包含微信号引导' },
    { pattern: /v信|v[\s:：]*[a-zA-Z0-9_]{5,}/gi, reason: '包含微信号' },
    // QQ号
    { pattern: /(qq|扣扣)[\s:：]*\d{5,}/gi, reason: '包含QQ号' },
    { pattern: /\d{5,11}\s*(加我|联系)/g, reason: '疑似QQ号' },
    // 支付宝
    { pattern: /(支付宝|alipay)[\s:：]/gi, reason: '包含支付宝信息' },
    // 银行卡
    { pattern: /\d{16,19}/g, reason: '疑似银行卡号' },
    // 线下交易引导
    { pattern: /(线下|私聊|私下|脱离平台|不走平台)/g, reason: '引导线下交易' },
    { pattern: /(直接转账|微信支付|扫码付)/g, reason: '引导私下支付' },
    // 邮箱
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, reason: '包含邮箱地址' },
  ];

  private readonly keywords: { word: string; reason: string }[] = [
    { word: '加我', reason: '引导私下联系' },
    { word: '私我', reason: '引导私下联系' },
    { word: '线下', reason: '引导线下交易' },
    { word: '便宜点', reason: '疑似议价引导' },
    { word: '不走平台', reason: '引导脱离平台' },
  ];

  filter(content: string): FilterResult {
    let blocked = false;
    let reason = '';

    // 正则匹配
    for (const { pattern, reason: r } of this.sensitivePatterns) {
      if (pattern.test(content)) {
        blocked = true;
        reason = r;
        pattern.lastIndex = 0;
        break;
      }
    }

    // 关键词匹配
    if (!blocked) {
      for (const { word, reason: r } of this.keywords) {
        if (content.includes(word)) {
          blocked = true;
          reason = r;
          break;
        }
      }
    }

    return { filtered: content, blocked, reason };
  }
}
