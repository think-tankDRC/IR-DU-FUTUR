const form = document.getElementById('registrationForm');
const formView = document.getElementById('formView');
const successBox = document.getElementById('successBox');
const successName = document.getElementById('successName');
const newRegistration = document.getElementById('newRegistration');
const submitButton = form.querySelector('[type="submit"]');

function validateField(input) {
  const field = input.closest('.field');
  const error = field.querySelector('.error');
  const value = input.value.trim();
  let message = '';

  if (input.required && !value) message = 'Ce champ est obligatoire.';
  else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Saisissez une adresse e-mail valide.';
  else if (input.type === 'tel' && !/^[+\d][\d\s().-]{7,19}$/.test(value)) message = 'Saisissez un numéro de téléphone valide.';

  field.classList.toggle('invalid', Boolean(message));
  error.textContent = message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

form.querySelectorAll('input, select').forEach(input => {
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('invalid')) validateField(input);
  });
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const inputs = [...form.querySelectorAll('input, select')];
  if (!inputs.map(validateField).every(Boolean)) {
    form.querySelector('.invalid input, .invalid select')?.focus();
    return;
  }

  if (!window.supabaseConfigured) {
    alert('Supabase n’est pas encore configuré. Renseignez supabase-config.js.');
    return;
  }

  const values = Object.fromEntries(new FormData(form).entries());
  const payload = {
    nom: values.nom,
    postnom: values.postnom,
    prenom: values.prenom,
    sexe: values.sexe,
    telephone: values.telephone,
    email: values.email,
    entreprise: values.entreprise || null,
    fonction: values.fonction || null,
    universite: values.universite,
    faculte: values.faculte,
    niveau_etude: values.niveauEtude
  };

  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Enregistrement…';

  try {
    const { error } = await window.supabaseDb.from('inscriptions').insert(payload);
    if (error) throw error;
    successName.textContent = values.prenom;
    formView.hidden = true;
    successBox.classList.add('show');
  } catch (error) {
    console.error(error);
    alert("L’inscription n’a pas pu être enregistrée. Vérifiez votre connexion ou la configuration Supabase.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

newRegistration.addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('.field').forEach(field => field.classList.remove('invalid'));
  form.querySelectorAll('.error').forEach(error => { error.textContent = ''; });
  successBox.classList.remove('show');
  formView.hidden = false;
  document.getElementById('nom').focus();
});
