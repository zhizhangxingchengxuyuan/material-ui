// @flow weak

import React, { Component, Children, cloneElement, PropTypes } from 'react';
import { createStyleSheet } from 'jss-theme-reactor';
import classNames from 'classnames';
import { easing } from '../styles/transitions';
import { createChainedFunction } from '../utils/helpers';

export const styleSheet = createStyleSheet('TextField', (theme) => {
  const focusColor = theme.palette.accent.A200;

  return {
    root: {
      display: 'flex',
      position: 'relative',
      marginTop: 16,
      // Expanding underline
      '&:after': {
        backgroundColor: focusColor,
        left: 0,
        bottom: 9,
        // Doing the other way around crash on IE11 "''"" https://github.com/cssinjs/jss/issues/242
        content: '""',
        height: 2,
        position: 'absolute',
        width: '100%',
        transform: 'scaleX(0)',
        transition: theme.transitions.create(
          'transform',
          '200ms',
          null,
          easing.easeOut,
        ),
      },
    },
    label: {},
    input: {
      display: 'block',
      marginTop: 10,
      marginBottom: 10,
      width: '100%',
      zIndex: 1,
    },
    focused: {
      '&:after': {
        transform: 'scaleX(1)',
      },
    },
    error: {
      '&:after': {
        backgroundColor: theme.palette.error[500],
        transform: 'scaleX(1)', // error is always underlined in red
      },
    },
  };
});

/**
 * TextField
 *
 * @see https://material.google.com/components/text-fields.html
 *
 * ```js
 * import TextField from 'material-ui/TextField';
 *
 * const Component = () => <TextField value="Hello World">;
 * ```
 */
export default class TextField extends Component {
  static propTypes = {
    /**
     * The contents of the `TextField`.
     */
    children: PropTypes.node,
    /**
     * The CSS class name of the root element.
     */
    className: PropTypes.string,
    /**
     * Whether the label should be displayed in an error state
     */
    error: PropTypes.bool,
    /**
     * Whether this label should indicate that the input
     * is required.
     */
    required: PropTypes.bool,
  };

  static contextTypes = {
    styleManager: PropTypes.object.isRequired,
  };

  state = {
    dirty: false,
    focused: false,
  };

  classes = {};

  handleFocus = () => this.setState({ focused: true });
  handleBlur = () => this.setState({ focused: false });

  handleDirty = () => {
    if (!this.state.dirty) {
      this.setState({ dirty: true });
    }
  };

  handleClean = () => {
    if (this.state.dirty) {
      this.setState({ dirty: false });
    }
  };

  renderChild = (child) => {
    const { muiName } = child.type;

    if (muiName === 'TextFieldInput') {
      return this.renderInput(child);
    } else if (muiName === 'TextFieldLabel') {
      return this.renderLabel(child);
    }

    return child;
  };

  renderInput = (input) => (
    cloneElement(input, {
      className: classNames(this.classes.input, input.props.className),
      onDirty: this.handleDirty,
      onClean: this.handleClean,
      onFocus: createChainedFunction(this.handleFocus, input.props.onFocus),
      onBlur: createChainedFunction(this.handleBlur, input.props.onBlur),
    })
  );

  renderLabel = (label) => (
    cloneElement(label, {
      className: classNames(this.classes.label, label.props.className),
      error: label.props.hasOwnProperty('error') ? label.props.error : this.props.error,
      focused: this.state.focused,
      required: label.props.hasOwnProperty('required') ? label.props.required : this.props.required,
      shrink: label.props.hasOwnProperty('shrink') ? // Shrink the label if dirty or focused
        label.props.shrink : (this.state.dirty || this.state.focused),
    })
  );

  render() {
    const {
      children,
      className: classNameProp,
      error,
      required, // eslint-disable-line no-unused-vars
      ...other
    } = this.props;

    this.classes = this.context.styleManager.render(styleSheet);

    const className = classNames({
      [this.classes.root]: true,
      [this.classes.focused]: this.state.focused,
      [this.classes.error]: error,
    }, classNameProp);

    return (
      <div className={className} {...other}>
        {Children.map(children, this.renderChild)}
      </div>
    );
  }
}
