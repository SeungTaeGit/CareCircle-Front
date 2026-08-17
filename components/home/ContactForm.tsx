'use client';

import React, { useState } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function ContactForm() {
  const { t } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    contactInfo: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("백엔드로 전송할 데이터:", formData);
    alert(t("도입 문의가 성공적으로 접수되었습니다!", "導入のお問い合わせが正常に受け付けられました！"));
    setFormData({ name: '', organization: '', contactInfo: '', message: '' });
  };

  return (
    <section id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('CareCircle 도입 문의', 'CareCircle 導入のお問い合わせ')}</h2>
          <p className="text-slate-500 break-keep">{t('복지관, 주간보호센터, 지자체 사업 담당자님의 연락을 기다립니다.', '福祉施設、デイケアセンター、自治体事業担当者様からのご連絡をお待ちしております。')}</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('담당자 성함', 'ご担当者名')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder={t("홍길동", "山田太郎")} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t('소속 기관명', '所属機関名')}</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder={t("ㅇㅇ복지관", "〇〇福祉センター")} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('연락처 (이메일 또는 전화번호)', 'ご連絡先 (メールまたは電話番号)')}</label>
              <input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="test@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('문의 내용', 'お問い合わせ内容')}</label>
              <textarea name="message" rows={4} value={formData.message} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder={t("도입 규모 및 궁금하신 점을 남겨주세요.", "導入規模やご不明な点をご記入ください。")} required />
            </div>
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-md text-lg transition-colors">
              {t('문의 접수하기', 'お問い合わせを受け付ける')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}