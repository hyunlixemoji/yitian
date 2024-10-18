document.addEventListener('DOMContentLoaded', () => {
    const layers = document.querySelectorAll('.layer');
    const modal = document.getElementById('time-picker');
    const datePickerModal = document.getElementById('date-picker');
    const mainTitle = document.getElementById('main-title');
    let currentInput;

    // 从本地存储恢复状态
    const storedData = JSON.parse(localStorage.getItem('userData')) || {};
    let currentDate = new Date().toISOString().split('T')[0]; // 默认为今天的日期

    // 设置初始日期
    mainTitle.querySelector('span').innerText = currentDate;

    // 初始化各层的输入框数量和内容
    loadDayData(currentDate);

    // 监听日期选择器
    document.getElementById('date-button').addEventListener('click', () => {
        datePickerModal.style.display = 'block';
    });

    document.getElementById('save-date').addEventListener('click', () => {
        const selectedDate = document.getElementById('date-input').value;
        mainTitle.querySelector('span').innerText = selectedDate;
        currentDate = selectedDate; // 更新当前日期
        loadDayData(currentDate); // 加载该日期的日程数据
        datePickerModal.style.display = 'none';
    });

    document.querySelector('.close-date').addEventListener('click', () => {
        datePickerModal.style.display = 'none';
    });

    // 初始化各层的输入框数量和内容
    function loadDayData(date) {
        layers.forEach(layer => {
            const inputsContainer = layer.querySelector('.inputs');
            const layerId = layer.id;
            const inputData = storedData[date]?.[layerId]?.inputs || [];

            // 清空输入框
            inputsContainer.innerHTML = '';

            // 添加保存的数据
            inputData.forEach(input => {
                addInput(inputsContainer, input.content, input.time);
            });

            // 确保初始输入框数量
            while (inputsContainer.childElementCount < getDefaultCount(layerId)) {
                addInput(inputsContainer);
            }
        });
    }

    function getDefaultCount(layerId) {
        return { zaochen: 2, shangwu: 3, zhongwu: 2, xiawu: 3, wanshang: 5 }[layerId] || 1;
    }

    function addInput(container, content = '', time = '选择时间') {
        const inputWrapper = document.createElement('div');
        inputWrapper.classList.add('input-wrapper');

        const timeInput = document.createElement('div');
        timeInput.textContent = time;
        timeInput.onclick = () => {
            currentInput = timeInput;
            openModal(timeInput);
        };

        const contentInput = document.createElement('textarea');
        contentInput.placeholder = '输入内容'; // 确保设置占位符
        contentInput.value = content; // 设置内容

        inputWrapper.append(timeInput, contentInput);
        container.appendChild(inputWrapper);

        contentInput.addEventListener('input', saveState); // 监听内容变化
        saveState(); // 保存状态
    }

    // 恢复输入框增减功能
    layers.forEach(layer => {
        const inputsContainer = layer.querySelector('.inputs');
        const addButton = layer.querySelector('.add');
        const removeButton = layer.querySelector('.remove');

        addButton.addEventListener('click', () => {
            addInput(inputsContainer);
        });

        removeButton.addEventListener('click', () => {
            if (inputsContainer.childElementCount > 1) {
                inputsContainer.lastElementChild.remove();
                saveState(); // 更新状态
            }
        });
    });

    function openModal(timeInput) {
        populateTimeSelects();
        modal.style.display = 'block';

        // 设置当前时间选择框的值
        if (timeInput) {
            const timeParts = timeInput.textContent.split('-');
            if (timeParts.length === 2) {
                const [start, end] = timeParts;
                const [startHour, startMinute] = start.split(':');
                const [endHour, endMinute] = end.split(':');
                document.getElementById('start-hour').value = startHour;
                document.getElementById('start-minute').value = startMinute;
                document.getElementById('end-hour').value = endHour;
                document.getElementById('end-minute').value = endMinute;
            }
        }
    }

    function populateTimeSelects() {
        ['start', 'end'].forEach(prefix => {
            const hourSelect = document.getElementById(`${prefix}-hour`);
            const minuteSelect = document.getElementById(`${prefix}-minute`);
            hourSelect.innerHTML = Array.from({ length: 24 }, (_, i) => `<option value="${i}">${i}</option>`).join('');
            minuteSelect.innerHTML = Array.from({ length: 60 }, (_, i) => `<option value="${i}">${i}</option>`).join('');
        });
    }

    // 时间选择框按钮事件
    document.getElementById('save-time').addEventListener('click', () => {
        const startHour = document.getElementById('start-hour').value.padStart(2, '0'); // 确保为两位数
        const startMinute = document.getElementById('start-minute').value.padStart(2, '0');
        const endHour = document.getElementById('end-hour').value.padStart(2, '0');
        const endMinute = document.getElementById('end-minute').value.padStart(2, '0');

        // 将选择的时间设置到当前输入框中，格式为xx:xx-xx:xx
        if (currentInput) {
            currentInput.textContent = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
        }

        modal.style.display = 'none'; // 隐藏时间选择框
        saveState(); // 保存状态
    });

    document.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');

    // 保存状态到本地存储
    function saveState() {
        const userData = storedData;
        userData[currentDate] = userData[currentDate] || {};
        layers.forEach(layer => {
            const layerId = layer.id;
            const inputsContainer = layer.querySelector('.inputs');
            userData[currentDate][layerId] = {
                inputs: Array.from(inputsContainer.children).map(inputWrapper => ({
                    content: inputWrapper.querySelector('textarea').value,
                    time: inputWrapper.querySelector('div').textContent // 获取时间文本
                }))
            };
        });
        localStorage.setItem('userData', JSON.stringify(userData));
    }
});
