'use strict';

const focusAreas = {
  ai: {
    caption: 'ENGINEERING + INVESTIGATION', title: 'Can it finish the job?',
    description: 'Agent workflows need more than a convincing answer. I work on repository tasks, tool use, and tests that check the result.',
    nodes: ['Define the task', 'Build the workflow', 'Test the behavior'], tags: ['Python', 'Docker', 'Agent workflows']
  },
  data: {
    caption: 'MODELS + BUSINESS CONTEXT', title: 'What does the data tell us?',
    description: 'From SQL exploration to predictive models and dashboards, I work on making operational data useful for decisions.',
    nodes: ['Understand the data', 'Model the problem', 'Explain the result'], tags: ['SQL', 'Machine learning', 'Power BI']
  },
  evaluation: {
    caption: 'EVIDENCE + HUMAN JUDGMENT', title: 'What would count as correct?',
    description: 'I design rubrics, investigate failure cases, and calibrate reviewers so that evaluation has a clear, shared standard.',
    nodes: ['Define the criteria', 'Inspect the evidence', 'Calibrate the judgment'], tags: ['Rubric design', 'RLHF / RLVR', 'Calibration']
  }
};

document.querySelectorAll('[data-focus]').forEach(button => {
  button.addEventListener('click', () => {
    const area = focusAreas[button.dataset.focus];
    document.querySelectorAll('[data-focus]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.getElementById('focus-caption').textContent = area.caption;
    document.getElementById('focus-title').textContent = area.title;
    document.getElementById('focus-description').textContent = area.description;
    ['node-start', 'node-middle', 'node-end'].forEach((id, index) => {
      document.querySelector(`#${id} strong`).textContent = area.nodes[index];
    });
    document.getElementById('focus-tags').replaceChildren(...area.tags.map(label => {
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = label; return tag;
    }));
  });
});

const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.work-card')];
filters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    cards.forEach(card => {
      const matches = category === 'all' || card.dataset.category.split(' ').includes(category);
      card.hidden = !matches;
      if (matches) count++;
    });
    document.getElementById('filter-count').textContent = `${count} work ${count === 1 ? 'area' : 'areas'}`;
  });
});

const workDetails = {
  agents: {
    kicker: 'AI ENGINEERING + EVALUATION', title: 'Long-horizon agent evaluation',
    lead: 'Tasks that ask an agent to investigate, implement, and verify, not just produce an answer.',
    context: 'My work across Pareto AI, Afterquery, and Turing includes Terminal Bench and Long Horizon Terminal Bench projects. These bring together repository work, tool use, task design, and evaluation.',
    contributions: ['Developing engineering tasks and the instructions that define their expected behavior.', 'Working on verification, rubric design, and calibration.', 'Investigating whether an agent’s implementation satisfies the task and whether the evaluation catches incomplete work.'],
    relevance: 'Relevant to agent engineering, evaluation infrastructure, and roles where completion must be demonstrated through code or system behavior.',
    stack: ['Python', 'Docker', 'Terminal Bench', 'Long Horizon Terminal Bench', 'Task design', 'Verification'],
    note: 'Experience summary across multiple projects. No private task artifacts or client results are included.'
  },
  quality: {
    kicker: 'RUBRICS + CALIBRATION', title: 'Rubric design and calibration',
    lead: 'Making judgments about model outputs specific enough to review, discuss, and repeat.',
    context: 'At Pareto AI and Turing, I have evaluated reasoning, code, factual accuracy, instruction alignment, and multimodal outputs. My responsibilities include rubric design, quality checks, and reviewer calibration.',
    contributions: ['Designing criteria and checks for hallucinations, unsupported answers, and data leakage.', 'Stress-testing model behavior with adversarial prompts and conflicting constraints.', 'Calibrating reviewers and using feedback to revise evaluation standards.', 'Working on RLHF and RLVR projects across training and evaluation.'],
    relevance: 'Relevant to evaluation engineering, model quality, safety testing, and teams that need consistent human review.',
    stack: ['Rubric design', 'Calibration', 'RLHF', 'RLVR', 'Adversarial testing', 'Python'],
    note: 'The interactive example on this page is an original illustration of evidence-based review, not a client evaluation rubric.'
  },
  models: {
    kicker: 'DATA SCIENCE + MACHINE LEARNING', title: 'Forecasting and predictive modeling',
    lead: 'Working from the data and the business question through exploration, features, and predictive modeling.',
    context: 'At Camara Education Ethiopia, I worked on predictive models using XGBoost and Random Forest, as well as regression and clustering. My Pareto AI work also includes forecasting and structured evaluation models in Python and Excel.',
    contributions: ['Using SQL for exploratory analysis and feature engineering.', 'Applying forecasting, regression, and clustering techniques to operational data.', 'Building reproducible analysis and evaluation workflows.', 'Connecting analytical outputs with reporting for business stakeholders.'],
    relevance: 'Relevant to applied data science, machine learning engineering, and analytical roles that connect models with operational decisions.',
    stack: ['Python', 'SQL', 'XGBoost', 'Random Forest', 'pandas', 'NumPy'],
    note: 'Related experience: operational analytics at Camara Education Ethiopia and forecasting work at Pareto AI.'
  },
  pipelines: {
    kicker: 'DATA ENGINEERING + BUSINESS INTELLIGENCE', title: 'Data pipelines and automation',
    lead: 'Bringing data sources, business logic, and reporting into a workflow people can use.',
    context: 'At IoToad, my work included SQL-based forecasting and budgeting, integration of data sources, and Power BI, Tableau, and SSRS reporting. I also worked on payroll and AI automation, Azure, Azure Data Factory, and CI/CD.',
    contributions: ['Building dashboards and reporting standards for business stakeholders.', 'Cleaning and integrating data using SQL Server, SQL, and Power BI.', 'Developing forecasting and budgeting models.', 'Working on automation and data engineering across business processes.'],
    relevance: 'Relevant to data engineering, BI development, analytics engineering, and business process automation.',
    stack: ['SQL Server', 'Power BI', 'Tableau', 'SSRS', 'Azure Data Factory', 'CI/CD'],
    note: 'Related experience: Data Analyst at IoToad, December 2022 to December 2023.'
  },
  multimodal: {
    kicker: 'AGENTS + MULTIMODAL EVALUATION', title: 'Agent and multimodal evaluation',
    lead: 'Reviewing the quality of actions, research, code, images, and other outputs across different AI workflows.',
    context: 'My Turing work includes computer-using agent development and evaluation, AI agents, RLGym, deep research and search evaluation, image and video labeling and annotation, game labeling, and fact checking.',
    contributions: ['Working on Python code implementation and evaluation.', 'Developing and evaluating AI agents and computer-use workflows.', 'Reviewing research and search outputs for accuracy and evidence.', 'Labeling and annotating video and image data.', 'Contributing to multimodal training and evaluation projects.'],
    relevance: 'Relevant to agent evaluation, multimodal QA, research evaluation, and human-in-the-loop AI development.',
    stack: ['Python', 'Computer-use agents', 'RLGym', 'Multimodal QA', 'Fact checking'],
    note: 'This is a summary of work areas across Turing projects. Client datasets and individual model results remain outside the portfolio.'
  },
  leadership: {
    kicker: 'TECHNICAL LEADERSHIP', title: 'Evaluation team leadership',
    lead: 'Technical quality depends on the people reviewing the work as well as the tools they use.',
    context: 'I joined Turing as a Python Developer in September 2023 and became Lead Python Developer in August 2024. I led an eight-person team of trainers and reviewers producing LLM training data and code-evaluation work.',
    contributions: ['Leading trainers and reviewers and supporting their day-to-day technical work.', 'Onboarding reviewers on annotation standards and quality checks.', 'Designing rubrics and calibrating scoring across the team.', 'Contributing across more than 20 projects through trainer and team-lead responsibilities.'],
    relevance: 'Relevant to evaluation team leadership, technical review, quality programs, and hands-on engineering leadership.',
    stack: ['Team leadership', 'Reviewer calibration', 'Onboarding', 'Python', 'Quality assurance'],
    note: 'Lead Python Developer at Turing from August 2024 to March 2026, following a Python Developer role.'
  }
};

const dialog = document.getElementById('case-dialog');
let dialogTrigger = null;
const textElement = (tag, text, className) => {
  const element = document.createElement(tag); element.textContent = text;
  if (className) element.className = className;
  return element;
};
document.querySelectorAll('[data-case]').forEach(button => {
  button.addEventListener('click', () => {
    const detail = workDetails[button.dataset.case];
    const content = document.getElementById('case-content');
    content.replaceChildren();
    content.append(textElement('p', detail.kicker, 'dialog-kicker'));
    const title = textElement('h2', detail.title, 'dialog-title'); title.id = 'case-title'; content.append(title);
    content.append(textElement('p', detail.lead, 'dialog-lead'));
    const sections = [['The context', detail.context], ['Where this experience fits', detail.relevance]];
    const context = textElement('section', '', 'case-section');
    context.append(textElement('h3', sections[0][0]), textElement('p', sections[0][1])); content.append(context);
    const contribution = textElement('section', '', 'case-section'); contribution.append(textElement('h3', 'My contribution'));
    const list = document.createElement('ul'); detail.contributions.forEach(item => list.append(textElement('li', item))); contribution.append(list); content.append(contribution);
    const relevant = textElement('section', '', 'case-section'); relevant.append(textElement('h3', sections[1][0]), textElement('p', sections[1][1])); content.append(relevant);
    const stack = textElement('div', '', 'dialog-stack'); detail.stack.forEach(item => stack.append(textElement('span', item, 'tag'))); content.append(stack);
    content.append(textElement('p', detail.note, 'case-notes'));
    dialogTrigger = button;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
    document.getElementById('close-dialog').focus();
  });
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus();
});

const demoInputs = [...document.querySelectorAll('.demo-controls input')];
demoInputs.forEach(input => input.addEventListener('change', () => {
  const checked = demoInputs.filter(item => item.checked).length;
  const result = document.getElementById('demo-result');
  result.dataset.state = checked === 3 ? 'pass' : 'review';
  result.querySelector('span').textContent = checked === 3 ? 'SUPPORTED BY THESE CHECKS' : `${checked} OF 3 CHECKS SUPPORTED`;
  result.querySelector('p').textContent = checked === 3
    ? 'This example now has evidence for each criterion. Real work may need additional checks for scope, safety, and edge cases.'
    : checked === 0
      ? 'The summary alone does not establish that the repair works.'
      : 'There is still a gap between the completion claim and the available evidence.';
}));

const navToggle = document.querySelector('.nav-toggle');
const closeNav = () => { navToggle.setAttribute('aria-expanded', 'false'); document.getElementById('nav-links').classList.remove('is-open'); };
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(expanded)); document.getElementById('nav-links').classList.toggle('is-open', expanded);
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { closeNav(); navToggle.focus(); } });

let toastTimer;
document.getElementById('copy-email').addEventListener('click', async () => {
  const toast = document.getElementById('toast');
  try { await navigator.clipboard.writeText('biniyamfikiru4@gmail.com'); toast.textContent = 'Email address copied.'; }
  catch { toast.textContent = 'Email: biniyamfikiru4@gmail.com. Select the address above to copy it.'; }
  toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5500);
});
document.getElementById('year').textContent = String(new Date().getFullYear());
