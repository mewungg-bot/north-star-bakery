const form = document.getElementById('contact-form');
const storageKey = 'north-star-bakery-contact-form';
const saveStatus = document.getElementById('save-status');
const successMessage = document.getElementById('success-message');

const fieldOrder = ['name', 'email', 'pickupDate', 'requestType', 'details'];

const fieldLabels = {
  name: 'Name',
  email: 'Email',
  pickupDate: 'Preferred pickup date',
  requestType: 'Request type',
  details: 'Item details'
};

const getField = (fieldName) => {
  return form.querySelector(`[data-field="${fieldName}"]`);
};

const getSerializedFormData = () => {
  const data = {};

  fieldOrder.forEach((fieldName) => {
    const element = getField(fieldName);
    data[fieldName] = element ? element.value.trim() : '';
  });

  return data;
};

const showError = (fieldName, message) => {
  const errorElement = document.getElementById(`error-${fieldName}`);
  const field = getField(fieldName);

  if (errorElement) {
    errorElement.textContent = message;
  }

  if (field) {
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }
};

const validateField = (fieldName) => {
  const field = getField(fieldName);

  if (!field) {
    return true;
  }

  const value = field.value.trim();
  const requiredFields = ['name', 'email', 'pickupDate', 'requestType', 'details'];

  if (requiredFields.includes(fieldName) && !value) {
    showError(fieldName, `${fieldLabels[fieldName]} is required.`);
    return false;
  }

  if (fieldName === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    showError(fieldName, 'Please enter a valid email address.');
    return false;
  }

  if (fieldName === 'pickupDate' && value) {
    const selectedDate = new Date(value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      showError(fieldName, 'Please choose a future pickup date.');
      return false;
    }
  }

  showError(fieldName, '');
  return true;
};

const saveDraft = () => {
  const data = getSerializedFormData();

  localStorage.setItem(storageKey, JSON.stringify(data));

  if (saveStatus) {
    saveStatus.textContent = 'Draft saved locally.';
  }
};

const restoreDraft = () => {
  try {
    const savedData = JSON.parse(localStorage.getItem(storageKey));

    if (!savedData) {
      return;
    }

    fieldOrder.forEach((fieldName) => {
      const field = getField(fieldName);

      if (field && savedData[fieldName]) {
        field.value = savedData[fieldName];
      }
    });

    if (saveStatus) {
      saveStatus.textContent = 'Saved form restored from this browser.';
    }
  } catch (error) {
    console.error('Unable to restore form data:', error);
  }
};

if (form) {
  fieldOrder.forEach((fieldName) => {
    const field = getField(fieldName);

    if (!field) {
      return;
    }

    field.addEventListener('input', () => {
      validateField(fieldName);
      saveDraft();

      if (successMessage) {
        successMessage.textContent = '';
      }
    });

    field.addEventListener('blur', () => {
      validateField(fieldName);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;

    fieldOrder.forEach((fieldName) => {
      if (!validateField(fieldName)) {
        isValid = false;
      }
    });

    if (!isValid) {
      if (saveStatus) {
        saveStatus.textContent = 'Please fix the highlighted fields.';
      }
      return;
    }

    saveDraft();

    if (successMessage) {
      successMessage.textContent = 'Your request is ready to send. We will be in touch soon.';
    }

    if (saveStatus) {
      saveStatus.textContent = 'Form data saved locally.';
    }
  });

  restoreDraft();
}
