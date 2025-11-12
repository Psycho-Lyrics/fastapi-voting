import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent';
import { Toaster } from 'react-hot-toast';

function App() {
  return (

      <Router>
          <Toaster
              position="bottom-left"
              reverseOrder={false}
              containerStyle={{ fontFamily: 'Inter, sans-serif' }}/>
        <AppContent />
      </Router>
  );
}

export default App;