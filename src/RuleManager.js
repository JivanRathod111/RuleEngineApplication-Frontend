import React, { useState } from 'react';
import axios from 'axios';

const RuleManager = () => {
    const [ruleString, setRuleString] = useState('');
    const [response, setResponse] = useState(null);
    const [fetchError, setFetchError] = useState(null);

    // Function to handle creating a new rule and fetching it by ID
    const handleCreateRule = async (event) => {
        event.preventDefault();
        try {
            // POST request to create a new rule
            const result = await axios.post('http://localhost:8081/api/rules/create', { ruleString });
            const createdRule = result.data;
            setRuleString(''); // Clear the input

            // Immediately fetch the created rule by its ID
            fetchRuleById(createdRule.id);
        } catch (error) {
            console.error("Error posting the rule", error);
            setFetchError("Failed to create rule.");
        }
    };

    // Function to fetch a rule by ID (after creation)
    const fetchRuleById = async (id) => {
        try {
            const result = await axios.get(`http://localhost:8081/api/rules/${id}`);
            setResponse(result.data); // Set the created rule's details
            setFetchError(null); // Clear any previous error
        } catch (error) {
            console.error("Error fetching the rule by ID", error);
            setFetchError("Failed to fetch rule details.");
            setResponse(null); // Clear previous response if fetch fails
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
        <div className="container mt-4">
            <h2 className="text-center mb-4">Create a New Rule</h2>
            <form onSubmit={handleCreateRule} className="mb-4">
                <div className="form-group">
                    <input
                        type="text"
                        value={ruleString}
                        onChange={(e) => setRuleString(e.target.value)}
                        placeholder="Enter rule string"
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Submit Rule</button>
            </form>

            {fetchError && (
                <div className="alert alert-danger mt-4">{fetchError}</div>
            )}

            {response && (
                <div className="card mt-4">
                    <div className="card-body">
                        <h5 className="card-title">Response from Server:</h5>
                        <p><strong>ID:</strong> {response.id}</p>
                        <p><strong>Rule String:</strong> {response.ruleString}</p>
                        <p><strong>AST:</strong></p>
                        {renderAST(response.ast)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RuleManager;
