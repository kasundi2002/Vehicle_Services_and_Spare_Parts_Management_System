import React, { Component } from 'react';

class FilterBox extends Component {
    state = {
        selectedField: '',
        sortOrder: 'asc'
    };

    handleFieldChange = (event) => {
        this.setState({ selectedField: event.target.value });
    };

    handleSortOrderChange = (event) => {
        this.setState({ sortOrder: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const { selectedField, sortOrder } = this.state;
        this.props.onSubmit(selectedField, sortOrder);
        // Reset the selected field and sort order after submission
        this.setState({ selectedField: '', sortOrder: '' });
    };

    render() {
        const styles = {
            filterBox: {
                background: '#f4f4f4',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                marginTop: '-100px',
                width: 'auto',
                height:'25%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center items horizontally
            },
            selectField: {
                padding: '10px',
                width:'100%',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
                marginBottom: '10px',
            },
            radioContainer: {
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center', // Center items horizontally
            },
            radioButton: {
                marginRight: '20px',
                cursor: 'pointer',
                fontSize: '16px',
            },
            submitButton: {
                padding: ' 20px',
                borderRadius: '5px',
                width: '50%',
                height:'30%',
                border: 'none',
                background: '#009688',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
            },
        };

        return (
            <div style={styles.filterBox}>
                <h2 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px' }}>Filter Employees</h2>
                <form onSubmit={this.handleSubmit}>
                    <select
                        value={this.state.selectedField}
                        onChange={this.handleFieldChange}
                        style={styles.selectField}
                    >
                        <option value="">Select Field</option>
                        <option value="employeeName">Employee Name</option>
                        <option value="NIC">NIC</option>
                        <option value="jobCategory">Job Category</option>
                    </select>
                    <div style={styles.radioContainer}>
                        <label style={styles.radioButton}>
                            <input
                                type="radio"
                                value="asc"
                                checked={this.state.sortOrder === 'asc'}
                                onChange={this.handleSortOrderChange}
                            />
                            Ascending
                        </label>
                        <label style={styles.radioButton}>
                            <input
                                type="radio"
                                value="desc"
                                checked={this.state.sortOrder === 'desc'}
                                onChange={this.handleSortOrderChange}
                            />
                            Descending
                        </label>
                    </div>
                    <button type="submit" style={styles.submitButton}>FILTER</button>
                </form>
            </div>
        );
    }
}

export default FilterBox;
