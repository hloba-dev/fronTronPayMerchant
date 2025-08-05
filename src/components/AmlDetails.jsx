import React, { useState } from 'react';
import './AmlDetails.css';

// Mapping from API keys to Russian labels
const amlCategoryTranslations = {
  // Risk Scores & General
  risk_score: 'Общий АМЛ',
  total_from_all_services: 'Всего со всех сервисов',

  // Signals (группировка по типу)
  'signals_atm': 'Сигнал: ATM',
  'signals_child_exploitation': 'Сигнал: Эксплуатация детей',
  'signals_dark_market': 'Сигнал: Даркнет',
  'signals_dark_service': 'Сигнал: Дарк-сервисы',
  'signals_enforcement_action': 'Сигнал: Правоприменительные действия',
  'signals_exchange_fraudulent': 'Сигнал: Мошеннические биржи',
  'signals_exchange_licensed': 'Сигнал: Лицензированные биржи',
  'signals_exchange_unlicensed': 'Сигнал: Нелицензированные биржи',
  'signals_gambling': 'Сигнал: Азартные игры',
  'signals_illegal_service': 'Сигнал: Нелегальные услуги',
  'signals_liquidity_pools': 'Сигнал: Пулы ликвидности',
  'signals_marketplace': 'Сигнал: Торговые площадки',
  'signals_miner': 'Сигнал: Майнеры',
  'signals_mixer': 'Сигнал: Миксеры',
  'signals_other': 'Сигнал: Другое',
  'signals_p2p_exchange_licensed': 'Сигнал: Лицензированные P2P-обменники',
  'signals_p2p_exchange_unlicensed': 'Сигнал: Нелицензированные P2P-обменники',
  'signals_p2p_exchange_risky': 'Сигнал: Рискованные P2P-обменники',
  'signals_payment': 'Сигнал: Платежные системы',
  'signals_ransom': 'Сигнал: Вымогательство',
  'signals_sanctions': 'Сигнал: Санкции',
  'signals_scam': 'Сигнал: Мошенничество',
  'signals_seized_assets': 'Сигнал: Арестованные активы',
  'signals_stolen_coins': 'Сигнал: Украденные монеты',
  'signals_stolen_funds': 'Сигнал: Украденные средства',
  'signals_terrorism_financing': 'Сигнал: Финансирование терроризма',
  'signals_wallet': 'Сигнал: Кошельки',
  'signals_wallet_malicious': 'Сигнал: Вредоносные кошельки',
  'signals_high_risk_exchange': 'Сигнал: Высокорисковые биржи',
  
  // Categories (могут дублироваться с сигналами, но лучше оставить для полноты)
  dark_market: 'Категория: Даркнет',
  dark_service: 'Категория: Дарк-сервисы',
  exchange_fraudulent: 'Категория: Мошеннические биржи',
  gambling: 'Категория: Азартные игры',
  illegal_service: 'Категория: Нелегальные услуги',
  marketplace: 'Категория: Торговые площадки',
  mixer: 'Категория: Миксеры',
  p2p_exchange_risky: 'Категория: Рискованные P2P-обменники',
  scam: 'Категория: Мошенничество',
  stolen_funds: 'Категория: Украденные средства',
  wallet_malicious: 'Категория: Вредоносные кошельки',
  high_risk_exchange: 'Категория: Высокорисковые биржи',
};

export default function AmlDetails({ details }) {
  const [isOpen, setIsOpen] = useState(false);

  const parseDetailsRecursive = (obj, prefix = '') => {
    let results = [];
    for (const key in obj) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        results = results.concat(parseDetailsRecursive(value, newKey));
      } else {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          const percentage = (numericValue * 100).toFixed(2);
          results.push({
            label: amlCategoryTranslations[newKey] || newKey.replace(/_/g, ' '),
            percentage,
            rawValue: numericValue,
          });
        }
      }
    }
    return results;
  };

  const parsedDetails = parseDetailsRecursive(details);

  if (parsedDetails.length === 0) {
    return <p className="no-aml-data">Нет значимых данных для отображения.</p>;
  }

  return (
    <div className="aml-details-container">
      <button onClick={() => setIsOpen(!isOpen)} className="aml-toggle-button">
        Показать AML детали
        <span className={`arrow ${isOpen ? 'open' : ''}`}></span>
      </button>
      {isOpen && (
        <div className="aml-details-content">
          {parsedDetails.map(({ label, percentage, rawValue }) => (
            <div key={label} className="aml-item">
              <div className="aml-item-header">
                <span className="aml-label">{label}</span>
                <span className="aml-percentage-value">{percentage}%</span>
              </div>
              <div className="aml-progress-bar">
                <div 
                  className="aml-progress-bar-inner" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 