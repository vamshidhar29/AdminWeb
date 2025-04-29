import React, { useEffect } from "react";


export default function ComponentWrapper(props) {

    const [loading, setLoading] = React.useState();
    const [error, setError] = React.useState();
    const [title, setTitle] = React.useState(props.title ? props.title : "")

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
        <div className="p-1 m-1" >
            <h5 className="fw-bold">{title}</h5>
            <div>
                {props.children}
            </div>
        </div>
    </>)
}