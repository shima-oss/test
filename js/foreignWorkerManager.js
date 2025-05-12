// 外国人労働者情報管理機能
document.addEventListener('DOMContentLoaded', () => {
  // 初期化
  loadForeignWorkersList();
  setupEventListeners();
});

// イベントリスナーのセットアップ
function setupEventListeners() {
  // タブ切り替え
  document.querySelectorAll('.tabs a').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = e.target.getAttribute('data-target');
      
      // アクティブタブのクラスを切り替え
      document.querySelectorAll('.tabs a').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      // タブコンテンツの表示/非表示を切り替え
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(targetId).style.display = 'block';
      
      // 顧客検索タブの場合は結果をクリア
      if (targetId === 'customer-tab') {
        document.getElementById('result').innerHTML = '';
      }
    });
  });
  
  // 新規登録フォームの送信ハンドラ
  document.getElementById('foreign-worker-form').addEventListener('submit', handleFormSubmit);
  
  // 検索フォームの送信ハンドラ
  document.getElementById('worker-search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    searchForeignWorkers();
  });
  
  // ステータスフィルターのクリックハンドラ
  document.querySelectorAll('.status-filter').forEach(button => {
    button.addEventListener('click', (e) => {
      const status = e.target.getAttribute('data-status');
      filterByStatus(status);
      
      // アクティブボタンのクラスを切り替え
      document.querySelectorAll('.status-filter').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

// 一覧表示
function loadForeignWorkersList() {
  const tableBody = document.getElementById('foreign-workers-list');
  tableBody.innerHTML = '';
  
  foreignWorkers.forEach(worker => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', worker.id);
    row.setAttribute('data-status', worker.status);
    
    // ステータスに応じたクラスを設定
    let statusClass = '';
    switch(worker.status) {
      case '許可済': statusClass = 'status-approved'; break;
      case '申請中': statusClass = 'status-pending'; break;
      case '更新中': statusClass = 'status-updating'; break;
      case '却下': statusClass = 'status-rejected'; break;
    }
    
    row.innerHTML = `
      <td>${worker.id}</td>
      <td>${worker.name}</td>
      <td>${worker.nationality}</td>
      <td>${worker.visaType}</td>
      <td>${formatDate(worker.visaExpiry)}</td>
      <td class="${statusClass}">${worker.status}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${worker.id}">編集</button>
        <button class="action-btn delete-btn" data-id="${worker.id}">削除</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // 編集ボタンのイベントハンドラを追加
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const workerId = e.target.getAttribute('data-id');
      openEditForm(workerId);
    });
  });
  
  // 削除ボタンのイベントハンドラを追加
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const workerId = e.target.getAttribute('data-id');
      deleteWorker(workerId);
    });
  });
  
  // 合計件数を更新
  updateTotalCount();
}

// ステータスでフィルタリング
function filterByStatus(status) {
  const rows = document.querySelectorAll('#foreign-workers-list tr');
  
  if (status === 'all') {
    rows.forEach(row => row.style.display = '');
  } else {
    rows.forEach(row => {
      const rowStatus = row.getAttribute('data-status');
      if (rowStatus === status) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  // 表示されている行数を更新
  updateFilteredCount(status);
}

// 検索機能
function searchForeignWorkers() {
  const searchTerm = document.getElementById('worker-search-input').value.trim().toLowerCase();
  const searchType = document.getElementById('search-type').value;
  
  const rows = document.querySelectorAll('#foreign-workers-list tr');
  
  rows.forEach(row => {
    const worker = foreignWorkers.find(w => w.id === row.getAttribute('data-id'));
    if (!worker) return;
    
    let match = false;
    
    if (searchTerm === '') {
      match = true;
    } else {
      switch(searchType) {
        case 'id':
          match = worker.id.toLowerCase().includes(searchTerm);
          break;
        case 'name':
          match = worker.name.toLowerCase().includes(searchTerm);
          break;
        case 'nationality':
          match = worker.nationality.toLowerCase().includes(searchTerm);
          break;
        case 'visa':
          match = worker.visaType.toLowerCase().includes(searchTerm);
          break;
        case 'all':
          match = Object.values(worker).some(val => 
            val.toString().toLowerCase().includes(searchTerm)
          );
          break;
      }
    }
    
    if (match) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  // 表示されている行数を更新
  updateSearchCount();
}

// 新規登録/編集フォーム送信処理
function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const workerId = formData.get('workerId');
  
  // フォームからデータを取得
  const workerData = {
    id: workerId || `F${String(foreignWorkers.length + 1).padStart(3, '0')}`,
    name: formData.get('name'),
    nationality: formData.get('nationality'),
    passportNo: formData.get('passportNo'),
    visaType: formData.get('visaType'),
    visaExpiry: formData.get('visaExpiry'),
    employer: formData.get('employer'),
    position: formData.get('position'),
    startDate: formData.get('startDate'),
    status: formData.get('status')
  };
  
  if (workerId) {
    // 既存データの更新
    const index = foreignWorkers.findIndex(w => w.id === workerId);
    if (index !== -1) {
      foreignWorkers[index] = workerData;
      showNotification('申請情報が更新されました', 'success');
    }
  } else {
    // 新規データの追加
    foreignWorkers.push(workerData);
    showNotification('新規申請情報が登録されました', 'success');
  }
  
  // フォームをリセット
  form.reset();
  document.getElementById('form-title').textContent = '新規登録';
  document.querySelector('button[type="submit"]').textContent = '登録';
  document.getElementById('workerId').value = '';
  
  // 一覧を再読み込み
  loadForeignWorkersList();
}

// 編集フォームを開く
function openEditForm(workerId) {
  const worker = foreignWorkers.find(w => w.id === workerId);
  if (!worker) return;
  
  // フォームにデータをセット
  const form = document.getElementById('foreign-worker-form');
  
  form.name.value = worker.name;
  form.nationality.value = worker.nationality;
  form.passportNo.value = worker.passportNo;
  form.visaType.value = worker.visaType;
  form.visaExpiry.value = worker.visaExpiry;
  form.employer.value = worker.employer;
  form.position.value = worker.position;
  form.startDate.value = worker.startDate;
  form.status.value = worker.status;
  form.workerId.value = worker.id;
  
  // フォームタイトルとボタンを変更
  document.getElementById('form-title').textContent = '申請情報編集';
  document.querySelector('button[type="submit"]').textContent = '更新';
  
  // 登録タブへ切り替え
  document.querySelector('.tabs a[data-target="registration-tab"]').click();
  
  // スクロールしてフォームを表示
  form.scrollIntoView({ behavior: 'smooth' });
}

// 申請情報を削除
function deleteWorker(workerId) {
  if (!confirm('この申請情報を削除してもよろしいですか？')) return;
  
  const index = foreignWorkers.findIndex(w => w.id === workerId);
  if (index !== -1) {
    foreignWorkers.splice(index, 1);
    loadForeignWorkersList();
    showNotification('申請情報が削除されました', 'info');
  }
}

// 通知メッセージを表示
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.getElementById('notifications').appendChild(notification);
  
  // 3秒後に自動的に消える
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// 日付をフォーマット
function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('ja-JP', options);
}

// 合計件数を更新
function updateTotalCount() {
  const total = foreignWorkers.length;
  document.getElementById('total-count').textContent = total;
}

// フィルタリング後の件数を更新
function updateFilteredCount(status) {
  const visibleRows = document.querySelectorAll('#foreign-workers-list tr[style=""]').length;
  const totalCount = document.getElementById('total-count');
  
  if (status === 'all') {
    totalCount.textContent = foreignWorkers.length;
  } else {
    totalCount.textContent = `${visibleRows} / ${foreignWorkers.length}`;
  }
}

// 検索後の件数を更新
function updateSearchCount() {
  const visibleRows = document.querySelectorAll('#foreign-workers-list tr[style=""]').length;
  const totalCount = document.getElementById('total-count');
  
  totalCount.textContent = `${visibleRows} / ${foreignWorkers.length}`;
} 