const { Formik, Field, Form } = window.Formik;
const { createSlice, configureStore } = window.RTK;
const { combineReducers } = window.Redux;
const { Provider, connect } = window.ReactRedux;
const { HashRouter, Route, Switch, withRouter } = window.ReactRouterDOM;

function saveLocalStorage(values) {
    localStorage.setItem("name", values.yourName);
    localStorage.setItem("phone", values.phone);
    localStorage.setItem("email", values.email);
    localStorage.setItem("message", values.message);
    localStorage.setItem("policy", values.policy);
}
const formOpenerSlice = createSlice({
    name: 'formOpener',
    initialState: "",
    reducers: {
        requestOpen: (state, action) => {
            if (state === "")
                return action.payload;
            return state;
        },
        requestFulfilled: state => ""
    }
});
const formAnimationSlice = createSlice({
    name: 'formAnimation',
    initialState: "",
    reducers: {
        formClosed: state => "",
        submitStart: state => "wait",
        submitSuccess: state => "success",
        submitError: state => "error"
    }
});
const mainReducer = combineReducers({
    formOpener: formOpenerSlice.reducer,
    formAnimation: formAnimationSlice.reducer
});
const store = configureStore({ reducer: mainReducer });

let validateFormCallback = undefined;
function captchaCallback() {
    if (validateFormCallback)
        validateFormCallback();
}

class MainForm extends React.Component {
    constructor(props) {
        super(props);
        this.renderButtonText = this.renderButtonText.bind(this);
        this.step = this.step.bind(this);
    }

    componentDidMount() {
        let captcha = document.getElementById("recaptcha");
        document.getElementById("recaptcha-place").appendChild(captcha);
        this.validateForm();
    }

    componentWillUnmount() {
        let captcha = document.getElementById("recaptcha");
        document.getElementById("recaptcha-store").appendChild(captcha);
        this.props.formClosed();
    }

    step(timestamp) {
        if (this.start === undefined) this.start = timestamp;
        let elapsed = timestamp - this.start;
        const time = 1000;
        let element = document.querySelector('.animation-wait');
        if (element)
            element.style.setProperty('--rotateTransform', 'rotate(' + (elapsed / time * 360) + 'deg)');
        if (this.props.animation === "wait") {
            window.requestAnimationFrame(this.step);
        } else {
            this.start = undefined;
        }
    }

    renderButtonText() {
        if (this.props.animation === 'success')
            return <span className="btn-animation animation-success"> </span>;
        if (this.props.animation === 'error')
            return <span className="btn-animation animation-error"> </span>;
        if (this.props.animation === 'wait') {
            window.requestAnimationFrame(this.step);
            return <span className="btn-animation animation-wait"> </span>;
        }
        return <span className="btn-animation animation-none">ОТПРАВИТЬ</span>;
    }

    render() {
        return (
            <div>
                <Formik

                    initialValues={{ yourName: localStorage.getItem("name"), email: localStorage.getItem("email"), phone: localStorage.getItem("phone"), message: localStorage.getItem("message"), policy: localStorage.getItem("policy") === "true" }}


                    validate={values => {
                        const errors = {};
                        if (!values.yourName) {
                            errors.yourName = 'Required';
                        }

                        if (!values.email) {
                            errors.email = 'Required';
                        } else if (
                            !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(values.email)
                        ) {
                            errors.email = 'Invalid';
                        }

                        if (!values.phone) {
                            errors.phone = 'Required';
                        }

                        if (!values.policy) {
                            errors.policy = 'Required';
                        }

                        if (grecaptcha.getResponse() === "") {
                            errors.captcha = 'Required';
                        }
                        return errors;
                    }}


                    onSubmit={(values, { setSubmitting }) => {
                        this.props.submitStart();
                        console.log(JSON.stringify(values));
                        const prom = fetch(
                            'https://formcarry.com/s/Vf5gz_Dw-z',
                            {
                                method: 'POST',
                                mode: 'cors',
                                cache: 'no-cache',
                                credentials: 'same-origin',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                redirect: 'follow',
                                referrerPolicy: 'no-referrer',
                                body: JSON.stringify(values)
                            }
                        );
                        prom.then((response) => {
                            if (response.ok)
                                this.props.submitSuccess();
                            else
                                this.props.submitError();
                            setSubmitting(false);
                        })
                    }}
                >
                    {/* Разметка формы */}
                    {({ isSubmitting, handleChange, handleBlur, values, errors, validateForm }) => {
                        this.validateForm = validateForm;
                        validateFormCallback = validateForm;
                        console.log(values);
                        saveLocalStorage(values);
                        return (
                            <Form>
                                <Field type="text" name="yourName" placeholder="Ваше имя" valid={errors.yourName ? 'false' : 'true'} />
                                <Field type="text" name="phone" placeholder="Телефон" valid={errors.phone ? 'false' : 'true'} />
                                <Field type="email" name="email" placeholder="E-mail" valid={errors.email ? 'false' : 'true'} />
                                <textarea
                                    name="message"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.message}
                                    placeholder="Ваш комментарий"
                                />
                                <label htmlFor="policy" className="c_box">
                                    <Field type="checkbox" className="cb" id="policy" name="policy" checked={values.policy} />
                                    <span className="cb_place"></span>
                                    <div>
                                        <span className="checkbox-text">
                                            Отправляя заявку, я даю согласие на <a href="">обработку своих персональных данных</a>.
                                </span>
                                    </div>
                                </label>
                                <div id="recaptcha-place"></div>
                                <button type="submit" disabled={isSubmitting || Object.keys(errors).length > 0}>
                                    {this.renderButtonText()}
                                </button>
                            </Form>
                        )
                    }}
                </Formik>
            </div>
        );
    }
}

function mapStateForm(state) {
    const { formAnimation } = state;
    return { animation: formAnimation }
}
const formAnimationActions = formAnimationSlice.actions;
const mapDispatchForm = {
    formClosed: formAnimationActions.formClosed,
    submitStart: formAnimationActions.submitStart,
    submitSuccess: formAnimationActions.submitSuccess,
    submitError: formAnimationActions.submitError
};
const WrappedMainForm = connect(mapStateForm, mapDispatchForm)(MainForm);

class ModalWindow extends React.Component {
    constructor(props) {

        super(props);
        let isOpen = props.location.pathname === "/form";
        if (isOpen) {
            props.history.replace("/");
            props.history.push("/form");
        }
        this.state = {
            animationInProgress: false
        }


        this.stepOpen = this.stepOpen.bind(this);
        this.playOpen = this.playOpen.bind(this);
        this.stepClose = this.stepClose.bind(this);
        this.playClose = this.playClose.bind(this);
        this.handleOffClick = this.handleOffClick.bind(this);
    }


    stepOpen(timestamp) {
        if (this.startOpen === undefined) this.startOpen = timestamp;
        let elapsed = timestamp - this.startOpen;
        const time = 1000;
        document.getElementById('moving-overlay').style.transform =
            'scale(' + Math.min(elapsed / time, 1) + ')';
        if (this.id) {
            let element = document.getElementById(this.id);
            let rect = element.getBoundingClientRect();
            let centerX = (rect.left + rect.right) / 2;
            let centerY = (rect.top + rect.bottom) / 2;
            let centerString = centerX + "px " + centerY + "px";
            document.getElementById('moving-overlay').style.transformOrigin = centerString;
        }
        document.getElementById('my-fixed-overlay').style.backgroundColor =
            'rgba(20, 20, 20, ' + Math.min(elapsed / time * 0.8, 0.8) + ')'
        if (elapsed < time) {
            window.requestAnimationFrame(this.stepOpen);
        } else {
            this.setState({ animationInProgress: false });
        }
    }


    playOpen(id) {
        grecaptcha.reset();
        if (this.state.animationInProgress) return;
        this.setState({ animationInProgress: true });
        this.props.history.push("/form");
        this.startOpen = undefined;

        this.id = id;
        window.requestAnimationFrame(this.stepOpen);
    }


    stepClose(timestamp) {
        if (this.startClose === undefined) this.startClose = timestamp;
        let elapsed = timestamp - this.startClose;
        const time = 1000;
        document.getElementById('moving-overlay').style.transform =
            'scale(' + (1 - Math.min(elapsed / time, 1)) + ')';
        if (this.id) {
            let element = document.getElementById(this.id);
            let rect = element.getBoundingClientRect();
            let centerX = (rect.left + rect.right) / 2;
            let centerY = (rect.top + rect.bottom) / 2;
            let centerString = centerX + "px " + centerY + "px";
            document.getElementById('moving-overlay').style.transformOrigin = centerString;
        }
        document.getElementById('my-fixed-overlay').style.backgroundColor =
            'rgba(20, 20, 20, ' + (0.8 - Math.min(elapsed / time * 0.8, 0.8)) + ')'
        if (elapsed < time) {
            window.requestAnimationFrame(this.stepClose);
        } else {
            this.setState({ animationInProgress: false });
            this.props.history.goBack();
        }
    }


    playClose() {
        if (this.state.animationInProgress) return;
        this.setState({ animationInProgress: true });
        this.startClose = undefined;
        if (this.id) {
            let element = document.getElementById(this.id);
            let rect = element.getBoundingClientRect();
            let centerX = (rect.left + rect.right) / 2;
            let centerY = (rect.top + rect.bottom) / 2;
            this.centerString = centerX + "px " + centerY + "px";
        }
        window.requestAnimationFrame(this.stepClose);
    }


    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location)
            this.setState({ animationInProgress: false });
        if (this.props.openRequest !== "") {
            this.playOpen(this.props.openRequest);
            this.props.requestFulfilled();
        }
    }


    handleOffClick(e) {
        if (document.getElementById('my-modal').contains(e.target)) return;
        this.playClose();
    }


    render() {
        return (
            <Switch>
                <Route path="/form">
                    <div id="my-fixed-overlay">
                        <div id="moving-overlay" onClick={this.handleOffClick}>
                            <div id="my-modal">
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </Route>
            </Switch>
        )
    }
}


function mapStateOpener(state) {
    const { formOpener } = state;
    return { openRequest: formOpener }
}

const mapDispatchOpener = { requestFulfilled: formOpenerSlice.actions.requestFulfilled };
const WrappedModalWindow = connect(mapStateOpener, mapDispatchOpener)(withRouter(ModalWindow));


function App() {
    return (
        <HashRouter>
            <Provider store={store}>
                <WrappedModalWindow>
                    <WrappedMainForm />
                </WrappedModalWindow>
            </Provider>
        </HashRouter>
    );
}
ReactDOM.render(<App />, document.getElementById('react-main'));
function clickHandler(e) {
    e.preventDefault();
    store.dispatch(formOpenerSlice.actions.requestOpen(e.target.id));
}
document.querySelectorAll(".form-opener")
    .forEach((elem) => elem.addEventListener("click", clickHandler));