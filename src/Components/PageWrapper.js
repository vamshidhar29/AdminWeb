import React, { useEffect } from "react";


export default function PageWrapper(props) {
    const [loading, setLoading] = React.useState();
    const [error, setError] = React.useState();
    useEffect(() => {
        setLoading(props.loading);
        setLoading(props.error);
    }, []);

    if (loading) {
        return (
            <div style={{ justifyContent: "center", alignItems: "center" }}>
                <div>

                </div>
                <h3>Loading.. please wait..</h3>
            </div>)
    }

    if (error) {
        return (
            <div style={{ justifyContent: "center", alignItems: "center" }}>
                <h3>Sorry. data not found.. something went wrong..</h3>
            </div>)
    }

    return (<>
        <div className="row">
            <div className="col-xxl">
                {props.children}
            </div>
        </div>
    </>)
}