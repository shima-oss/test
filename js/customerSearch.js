// 顧客検索機能
document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchButton');
  const customerIdInput = document.getElementById('customerId');
  
  // Enter キーでも検索できるようにする
  customerIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchCustomer();
    }
  });
  
  // 検索ボタンのイベントリスナー
  searchButton.addEventListener('click', searchCustomer);
  
  // フォーカス時にフォームをクリアする（オプション）
  customerIdInput.addEventListener('focus', () => {
    document.getElementById('result').innerHTML = '';
  });
});

// 顧客検索関数
function searchCustomer() {
  const id = document.getElementById('customerId').value.trim();
  const resultDiv = document.getElementById('result');
  
  // 入力が空の場合
  if (!id) {
    resultDiv.innerHTML = `<div class="error-message">顧客IDを入力してください</div>`;
    return;
  }
  
  // 該当する顧客を検索
  const customer = customers.find(c => c.id === id);
  
  if (customer) {
    // 顧客情報を表示
    resultDiv.innerHTML = `
      <div class="customer-card">
        <h2>顧客情報</h2>
        <div class="customer-info">
          <div class="info-label" data-type="name">氏名:</div>
          <div>${customer.name}</div>
          
          <div class="info-label" data-type="email">メール:</div>
          <div>${customer.email}</div>
          
          <div class="info-label" data-type="tel">電話番号:</div>
          <div>${customer.tel}</div>
          
          <div class="info-label" data-type="address">住所:</div>
          <div>${customer.address}</div>
          
          <div class="info-label" data-type="rank">会員ランク:</div>
          <div>${getRankBadge(customer.rank)}${customer.rank}</div>
        </div>
      </div>
    `;
  } else {
    // 顧客が見つからない場合
    resultDiv.innerHTML = `<div class="error-message">該当する顧客が見つかりません</div>`;
  }
}

// ランクに応じたバッジを返す補助関数
function getRankBadge(rank) {
  switch(rank) {
    case 'ゴールド':
      return '<span style="color: gold; margin-right: 5px;">★</span>';
    case 'シルバー':
      return '<span style="color: silver; margin-right: 5px;">★</span>';
    case 'ブロンズ':
      return '<span style="color: #cd7f32; margin-right: 5px;">★</span>';
    default:
      return '';
  }
} 