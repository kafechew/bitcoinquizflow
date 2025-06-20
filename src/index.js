import { runWorkflow, startScheduler } from './workflow.js';

const command = process.argv[2];

console.log('🪙 BitcoinQuizFlow - Automated Quiz Generation');
console.log('============================================\n');

switch (command) {
  case 'schedule':
    console.log('📅 Starting scheduler mode...');
    startScheduler();
    break;
    
  case 'once':
  default:
    console.log('🚀 Running workflow once...');
    runWorkflow()
      .then(result => {
        console.log('\n📊 Workflow Result:', result);
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('\n💥 Workflow crashed:', error);
        process.exit(1);
      });
    break;
}