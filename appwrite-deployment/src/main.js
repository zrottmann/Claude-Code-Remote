// Claude Code Remote - Main Application
import './style.css';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('Claude Code Remote - Initialized!');
  
  // Set deployment timestamp
  const deployTimeElement = document.getElementById('deployTime');
  if (deployTimeElement) {
    deployTimeElement.textContent = new Date().toLocaleString();
  }
  
  // Add click handlers for interactive features
  const features = document.querySelectorAll('.feature');
  features.forEach(feature => {
    feature.addEventListener('click', () => {
      console.log('Feature clicked:', feature.textContent);
    });
  });
  
  console.log('✅ Claude Code Remote is ready!');
});