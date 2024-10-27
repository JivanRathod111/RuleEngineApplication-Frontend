import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RuleEvaluator = () => {
    const [rules, setRules] = useState([]); // State for storing the list of rules
    const [selectedRule, setSelectedRule] = useState(null); // State for storing the selected rule
    const [ast, setAst] = useState(''); // AST of the selected rule
    const [userData, setUserData] = useState({
        age: '',
        department: '',
        salary: '',
        experience: ''
    });
    const [result, setResult] = useState(null); // Evaluation result
    const [error, setError] = useState(''); // Error message

    // Fetch rules on component mount
    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/rules'); // Replace with your actual API
                setRules(response.data); // Assume the API returns an array of rule objects
            } catch (err) {
                console.error(err);
                setError('Error fetching rules. Please check the server.');
            }
        };

        fetchRules();
    }, []);

    // Fetch the AST for the selected rule
    const handleRuleSelect = (ruleString) => {
        try {
            const astObject = parseRuleStringToAST(ruleString); // Convert rule string to AST
            setAst(JSON.stringify(astObject, null, 2)); // Populate AST field with formatted JSON
            setSelectedRule(ruleString); // Store the entire rule string
            setUserData({ age: '', department: '', salary: '', experience: '' }); // Reset user data
            setResult(null); // Reset result
            setError(''); // Reset error
        } catch (err) {
            console.error(err);
            setError('Error converting rule string to AST.');
        }
    };

    // Convert a rule string into AST format
    const parseRuleStringToAST = (ruleString) => {
        // This is a basic parser implementation. Adjust as necessary for your rule syntax.
        const andOrRegex = /\s+(AND|OR)\s+/gi;
        const comparisonRegex = /([a-zA-Z]+)\s*([><=]+)\s*([^ AND OR]+)/g;

        const tokens = ruleString.split(andOrRegex).filter(Boolean);
        const ast = {
            type: 'operator',
            value: 'AND', // Root operator is assumed to be AND
            left: null,
            right: null
        };

        const buildExpressionTree = (token, operator) => {
            const match = [...token.matchAll(comparisonRegex)][0];
            if (match) {
                return {
                    type: 'operator',
                    value: operator,
                    left: {
                        type: 'identifier',
                        name: match[1]
                    },
                    right: {
                        type: 'literal',
                        value: match[3].trim()
                    }
                };
            }
            return null;
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].trim();
            const operator = i < tokens.length - 1 ? tokens[i + 1].trim() : null;

            const expressionTree = buildExpressionTree(token, operator);
            if (expressionTree) {
                if (ast.left === null) {
                    ast.left = expressionTree;
                } else {
                    ast.right = expressionTree;
                    break; // Stop after processing the first AND/OR pair
                }
            }
        }

        return ast;
    };

    // Handle user data change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Evaluate the AST against user data
    const evaluateAST = (node, data) => {
        switch (node.type) {
            case 'operator':
                const left = evaluateAST(node.left, data);
                const right = evaluateAST(node.right, data);
                switch (node.value) {
                    case 'AND': return left && right;
                    case 'OR': return left || right;
                    case '>': return left > right;
                    case '>=': return left >= right;
                    case '<': return left < right;
                    case '<=': return left <= right;
                    case '=': return left === right;
                    case '!=': return left !== right;
                    default: throw new Error(`Unsupported operator ${node.value}`);
                }
            case 'identifier':
                return data[node.name]; // Return the value of the user data for the identifier
            case 'literal':
                return node.value; // Return the literal value
            default:
                throw new Error(`Unsupported node type ${node.type}`);
        }
    };

    // Handle evaluation of the selected rule
    const handleEvaluate = () => {
        if (!selectedRule) {
            setError('No rule selected or rule does not have an AST.');
            return;
        }

        setError('');
        setResult(null);

        const parsedData = {
            age: parseInt(userData.age, 10),
            department: userData.department,
            salary: parseFloat(userData.salary),
            experience: parseInt(userData.experience, 10)
        };

        try {
            // Parse the AST from the JSON string
            const astObject = JSON.parse(ast);
            // Evaluate the AST against the parsed user data
            const evaluationResult = evaluateAST(astObject, parsedData);
            setResult(evaluationResult ? 'Pass' : 'Fail');
        } catch (err) {
            console.error(err);
            setError('Error evaluating the rule. Please check the AST structure.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Rule Evaluator</h1>
            
            <div>
                <h2>Available Rules</h2>
                <ul>
                    {rules.map((rule) => (
                        <li key={rule.id} onClick={() => handleRuleSelect(rule.ruleString)}>
                            {rule.ruleString} {/* Adjust according to your rule object structure */}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedRule && (
                <div>
                    <div>
                        <label>
                            AST (JSON):
                            <textarea
                                value={ast}
                                readOnly
                                rows="6"
                                cols="50"
                            />
                        </label>
                    </div>

                    <div>
                        <h3>User Data</h3>
                        <form>
                            <div>
                                <label>
                                    Age:
                                    <input
                                        type="number"
                                        name="age"
                                        value={userData.age}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Department:
                                    <input
                                        type="text"
                                        name="department"
                                        value={userData.department}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Salary:
                                    <input
                                        type="number"
                                        name="salary"
                                        value={userData.salary}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Experience:
                                    <input
                                        type="number"
                                        name="experience"
                                        value={userData.experience}
                                        onChange={handleChange}
                                    />
                                </label>
                            </div>
                        </form>
                    </div>
                    <button onClick={handleEvaluate}>Evaluate Rule</button>

                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    {result !== null && (
                        <div>
                            <h2>Result</h2>
                            <p>User Evaluation: {result}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RuleEvaluator;

