import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RuleEvaluator from './RuleEvaluator';
import RuleManager from './RuleManager';
import RuleCombiner from './RuleCombiner';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                <Link to="/manager" className="nav-link">Rule Creation</Link>
                    <Link to="/" className="nav-link">Rule Evaluator</Link>
                    <Link to="/combiner" className="nav-link">Rule Combiner</Link>
                </nav>
                <div className="content">
                    <Routes>
                        <Route path="/" element={<RuleEvaluator />} />
                        <Route path="/manager" element={<RuleManager />} />
                        <Route path="/combiner" element={<RuleCombiner />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
