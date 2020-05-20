import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from '../../../store/actions/index';

class Logout extends Component {
    componentDidMount () {
        this.props.onLogout();
    }

    render () {
        return <Redirect to="/"/>;
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => {console.log('Logout.js unutar fn. gdje je disptach(),da potvrdimo aktiviaju') ; 
        return dispatch(actions.logout())}
    };
};

export default connect(null, mapDispatchToProps)(Logout);