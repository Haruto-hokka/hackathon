// 入力ページ用JavaScript

document.addEventListener('DOMContentLoaded', function() {
  console.log('入力ページを初期化中...');
  
  // カラースライダーの初期化
  initializeColorSlider();
  
  // スライダーの初期化
  initializeSliders();
  
  // テーブル入力の初期化
  initializeTableInputs();
  
  // 決定ボタンの初期化
  initializeDecisionButton();
  
  console.log('入力ページの初期化が完了しました');
});

// カラースライダーの初期化
function initializeColorSlider() {
  const colorSlider = document.getElementById('colorSlider');
  if (!colorSlider) {
    console.warn('カラースライダーが見つかりません');
    return;
  }
  
  console.log('カラースライダーを初期化中...');
  
  // カラースライダーの値変更時の処理
  colorSlider.addEventListener('input', function() {
    const hue = this.value;
    const color = `hsl(${hue}, 70%, 50%)`;
    
    // スライダーのつまみの色を更新
    this.style.setProperty('--slider-color', color);
    
    // つまみの色を動的に変更
    updateColorSliderThumb(this, color);
  });
  
  // 初期色を設定
  colorSlider.dispatchEvent(new Event('input'));
  console.log('カラースライダーの初期化が完了しました');
}

// カラースライダーのつまみの色を更新
function updateColorSliderThumb(slider, color) {
  // CSSカスタムプロパティを使用してつまみの色を変更
  slider.style.setProperty('--thumb-color', color);
  
  // スタイルシートを動的に更新
  const styleId = 'color-slider-thumb-style';
  let style = document.getElementById(styleId);
  
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }
  
  style.textContent = `
    .color-slider::-webkit-slider-thumb {
      background: var(--thumb-color, #ff0000) !important;
    }
    .color-slider::-moz-range-thumb {
      background: var(--thumb-color, #ff0000) !important;
    }
  `;
}

// スライダーの初期化
function initializeSliders() {
  const sliders = document.querySelectorAll('.standard-slider');
  console.log(`${sliders.length}個のスライダーを初期化中...`);
  
  sliders.forEach(slider => {
    // スライダーの値変更時の処理
    slider.addEventListener('input', function() {
      console.log(`${this.id}: ${this.value}`);
    });
  });
  
  console.log('スライダーの初期化が完了しました');
}

// テーブル入力の初期化
function initializeTableInputs() {
  const inputs = document.querySelectorAll('.table-input');
  console.log(`${inputs.length}個のテーブル入力を初期化中...`);
  
  inputs.forEach(input => {
    // 入力値の変更時の処理
    input.addEventListener('input', function() {
      console.log(`${this.placeholder}: ${this.value}`);
    });
    
    // フォーカス時の処理
    input.addEventListener('focus', function() {
      this.parentElement.style.backgroundColor = 'var(--color-surface-hover)';
    });
    
    // フォーカスアウト時の処理
    input.addEventListener('blur', function() {
      this.parentElement.style.backgroundColor = '';
    });
  });
  
  console.log('テーブル入力の初期化が完了しました');
}

// 決定ボタンの初期化
function initializeDecisionButton() {
  const decisionButton = document.getElementById('decisionButton');
  if (!decisionButton) {
    console.error('決定ボタンが見つかりません');
    return;
  }
  
  console.log('決定ボタンを初期化中...');
  
  decisionButton.addEventListener('click', function() {
    console.log('決定ボタンがクリックされました');
    handleDecision();
  });
  
  console.log('決定ボタンの初期化が完了しました');
}

// 決定ボタンの処理
function handleDecision() {
  console.log('決定処理を開始...');
  
  try {
    // データの収集
    const data = collectInputData();
    console.log('収集されたデータ:', data);
    
    // データの検証
    if (!validateInputData(data)) {
      console.warn('データ検証に失敗しました');
      showMessage('必須項目を入力してください', 'error');
      return;
    }
    
    console.log('データ検証が完了しました');
    
    // データマネージャーが利用可能な場合は直接追加
    if (window.DataManager) {
      console.log('データマネージャーを使用してデータを保存中...');
      window.DataManager.addFromInputPage(data);
      showMessage('データを保存しました', 'success');
    } else {
      // フォールバック: ローカルストレージに保存
      console.log('フォールバック: ローカルストレージに保存中...');
      saveInputData(data);
      showMessage('データを保存しました（オフライン）', 'success');
    }
    
    // フォームのリセット
    resetForm();
    
    // ホームページにリダイレクト
    setTimeout(() => {
      console.log('ホームページにリダイレクト中...');
      window.location.href = 'index.html';
    }, 1500);
    
  } catch (error) {
    console.error('決定処理でエラーが発生しました:', error);
    showMessage('エラーが発生しました: ' + error.message, 'error');
  }
}

// 入力データの収集
function collectInputData() {
  console.log('入力データを収集中...');
  
  const data = {
    tableData: {},
    sliderData: {},
    timestamp: new Date().toISOString()
  };
  
  // テーブルデータの収集
  const tableInputs = document.querySelectorAll('.table-input');
  tableInputs.forEach(input => {
    if (input.value.trim()) {
      data.tableData[input.placeholder] = input.value;
      console.log(`テーブルデータ: ${input.placeholder} = ${input.value}`);
    }
  });
  
  // スライダーデータの収集
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    data.sliderData[slider.id] = parseInt(slider.value);
    console.log(`スライダーデータ: ${slider.id} = ${slider.value}`);
  });
  
  console.log('収集されたデータ:', data);
  return data;
}

// 入力データの検証
function validateInputData(data) {
  console.log('データ検証を開始...');
  
  // 商品名は必須
  if (!data.tableData['商品名']) {
    console.warn('商品名が入力されていません');
    return false;
  }
  
  console.log('データ検証が完了しました');
  return true;
}

// データの保存（フォールバック用）
function saveInputData(data) {
  try {
    console.log('ローカルストレージにデータを保存中...');
    
    // 既存のデータを取得
    const existingData = JSON.parse(localStorage.getItem('clothingData') || '[]');
    console.log('既存のデータ:', existingData);
    
    // 新しいデータを追加
    existingData.push(data);
    
    // ローカルストレージに保存
    localStorage.setItem('clothingData', JSON.stringify(existingData));
    
    console.log('データを保存しました:', data);
    return true;
    
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
    throw error;
  }
}

// メッセージの表示
function showMessage(message, type = 'info') {
  console.log(`メッセージを表示: ${type} - ${message}`);
  
  // シンプルなアラートで表示（将来的にはモーダルやトーストに変更可能）
  const alertType = type === 'error' ? 'エラー' : type === 'success' ? '成功' : '情報';
  alert(`${alertType}: ${message}`);
}

// フォームのリセット
function resetForm() {
  console.log('フォームをリセット中...');
  
  // テーブル入力をリセット
  const tableInputs = document.querySelectorAll('.table-input');
  tableInputs.forEach(input => {
    input.value = '';
  });
  
  // スライダーをリセット
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const defaultValue = slider.getAttribute('value') || 50;
    slider.value = defaultValue;
    slider.dispatchEvent(new Event('input'));
  });
  
  console.log('フォームをリセットしました');
}

// データの読み込み機能（将来的な拡張用）
function loadInputData() {
  const savedData = localStorage.getItem('inputData');
  if (!savedData) return;
  
  try {
    const data = JSON.parse(savedData);
    
    // テーブルデータの復元
    if (data.tableData) {
      Object.keys(data.tableData).forEach(placeholder => {
        const input = document.querySelector(`input[placeholder="${placeholder}"]`);
        if (input) {
          input.value = data.tableData[placeholder];
        }
      });
    }
    
    // スライダーデータの復元
    if (data.sliderData) {
      Object.keys(data.sliderData).forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
          slider.value = data.sliderData[id];
          slider.dispatchEvent(new Event('input'));
        }
      });
    }
    
    console.log('データを読み込みました:', data);
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
  }
}

// データの検証機能
function validateForm() {
  const errors = [];
  
  // 必須項目のチェック（例：商品名）
  const itemNameInput = document.querySelector('input[placeholder="商品名"]');
  if (itemNameInput && !itemNameInput.value.trim()) {
    errors.push('商品名は必須です');
  }
  
  // スライダーの値チェック
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const value = parseInt(slider.value);
    const min = parseInt(slider.min);
    const max = parseInt(slider.max);
    
    if (value < min || value > max) {
      errors.push(`${slider.id}の値が範囲外です`);
    }
  });
  
  if (errors.length > 0) {
    console.error('バリデーションエラー:', errors);
    return false;
  }
  
  return true;
}

// グローバル関数として公開（将来的な拡張用）
window.inputPage = {
  saveData: saveInputData,
  loadData: loadInputData,
  resetForm: resetForm,
  validateForm: validateForm,
  handleDecision: handleDecision
}; 