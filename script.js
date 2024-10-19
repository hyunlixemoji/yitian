document.addEventListener('DOMContentLoaded', () => {
    const layers = document.querySelectorAll('.layer');
    const modal = document.getElementById('time-picker');
    const datePickerModal = document.getElementById('date-picker');
    const mainTitle = document.getElementById('main-title');
    let currentInput;

    const storedData = JSON.parse(localStorage.getItem('userData')) || {};
    let currentDate = new Date().toISOString().split('T')[0];

    mainTitle.querySelector('span').innerText = currentDate;
    loadDayData(currentDate);

    document.getElementById('date-button').addEventListener('click', () => {
        datePickerModal.style.display = 'block';
    });

    document.getElementById('save-date').addEventListener('click', () => {
        const selectedDate = document.getElementById('date-input').value;
        mainTitle.querySelector('span').innerText = selectedDate;
        currentDate = selectedDate;
        loadDayData(currentDate);
        datePickerModal.style.display = 'none';
    });

    document.querySelector('.close-date').addEventListener('click', () => {
        datePickerModal.style.display = 'none';
    });

    function loadDayData(date) {
        layers.forEach(layer => {
            const inputsContainer = layer.querySelector('.inputs');
            const layerId = layer.id;
            const inputData = storedData[date]?.[layerId]?.inputs || [];

            inputsContainer.innerHTML = '';

            inputData.forEach(input => {
                addInput(inputsContainer, input.content, input.time);
            });

            // 确保每层至少有一个输入框
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
        contentInput.placeholder = '输入内容';
        contentInput.value = content;

        inputWrapper.append(timeInput, contentInput);
        container.appendChild(inputWrapper);

        contentInput.addEventListener('input', saveState);
    }

    layers.forEach(layer => {
        const inputsContainer = layer.querySelector('.inputs');
        const addButton = layer.querySelector('.add');
        const removeButton = layer.querySelector('.remove');

        addButton.addEventListener('click', () => {
            addInput(inputsContainer);
            saveState(); // 更新状态
        });

        removeButton.addEventListener('click', () => {
            // 确保至少保留一个输入框
            if (inputsContainer.childElementCount > 1) {
                inputsContainer.lastElementChild.remove();
                saveState(); // 更新状态
            }
        });
    });

    function openModal(timeInput) {
        populateTimeSelects();
        modal.style.display = 'block';

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

    document.getElementById('save-time').addEventListener('click', () => {
        const startHour = document.getElementById('start-hour').value.padStart(2, '0');
        const startMinute = document.getElementById('start-minute').value.padStart(2, '0');
        const endHour = document.getElementById('end-hour').value.padStart(2, '0');
        const endMinute = document.getElementById('end-minute').value.padStart(2, '0');

        if (currentInput) {
            currentInput.textContent = `${startHour}:${startMinute}-${endHour}:${endMinute}`;
        }

        modal.style.display = 'none';
        saveState();
    });

    document.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');

    function saveState() {
        const userData = { ...storedData };
        userData[currentDate] = userData[currentDate] || {};
        
        layers.forEach(layer => {
            const layerId = layer.id;
            const inputsContainer = layer.querySelector('.inputs');
            userData[currentDate][layerId] = {
                inputs: Array.from(inputsContainer.children).map(inputWrapper => ({
                    content: inputWrapper.querySelector('textarea').value,
                    time: inputWrapper.querySelector('div').textContent
                }))
            };
        });
        
        localStorage.setItem('userData', JSON.stringify(userData));
    }
});
