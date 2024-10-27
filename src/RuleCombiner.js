import React, { useState } from 'react';
import axios from 'axios';

const RuleCombiner = () => {
    const [rules, setRules] = useState([""]);
    const [combinedAST, setCombinedAST] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    // Update a specific rule in the list
    const handleRuleChange = (index, value) => {
        const newRules = [...rules];
        newRules[index] = value;
        setRules(newRules);
    };

    // Add a new rule input
    const addRule = () => {
        setRules([...rules, ""]);
    };

    // Combine the rules into a single AST
    const combineRules = async () => {
        try {
            const response = await axios.post('http://localhost:8081/api/rules/combine', { rules });
            setCombinedAST(response.data); // Set the combined AST from the response
            setFetchError(null); // Clear any previous error
        } catch (error) {
            console.error("Error combining rules", error);
            setFetchError("Failed to combine rules.");
            setCombinedAST(null);
        }
    };

    // Recursive function to render AST in a tree structure
    const renderAST = (node) => {
        if (!node) return null;
        return (
            <ul>
                <li>
                    <strong>Type:</strong> {node.type}
                    {node.value && (
                        <>
                            <br />
                            <strong>Value:</strong> {node.value}
                        </>
                    )}
                    {node.left && (
                        <>
                            <br />
                            <strong>Left:</strong> {renderAST(node.left)}
                        </>
                    )}
                    {node.right && (
                        <>
                            <br />
                            <strong>Right:</strong> {renderAST(node.right)}
                        </>
                    )}
                </li>
            </ul>
        );
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Combine Rules</h1>
            {rules.map((rule, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                    <input
                        type="text"
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        placeholder="Enter rule (e.g., 'age > 30')"
                        style={{ padding: "5px", width: "300px" }}
                    />
                </div>
            ))}
            <button onClick={addRule} style={{ padding: "5px 10px", marginRight: "10px" }}>
                Add Rule
            </button>
            <button onClick={combineRules} style={{ padding: "5px 10px" }}>
                Combine Rules
            </button>

            {fetchError && (
                <div className="alert alert-danger mt-4">{fetchError}</div>
            )}

            {combinedAST && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Combined AST:</h2>
                    {renderAST(combinedAST)}
                </div>
            )}
        </div>
    );
};

export default RuleCombiner;
