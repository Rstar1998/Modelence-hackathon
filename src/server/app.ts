import 'dotenv/config'; 

import { startApp } from 'modelence/server';


import questionGeneratorModule from './question-generator'; 

startApp({
  modules: [
    questionGeneratorModule 
  ]
});