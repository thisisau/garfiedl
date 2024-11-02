import { useState } from "react";
import { useAlertHandler } from "./alert_hooks";
import React from "react";
import { AlertsContext } from "./alert_context";

export function GlobalElement() {
    const alertHandler = useAlertHandler();
    const [elements, setElements] = useState(
        Object.values(alertHandler?.alerts)
    );
    React.useEffect(() => {
        alertHandler?.onChange((e) => setElements(Object.values(e)));

        // if (new URLSearchParams(location.search).get("login"))
        //     setAssets(
        //         <Modal
        //             title="Log In"
        //         >
        //             <Login ab={[assets, setAssets]} />
        //         </Modal>
        //     );
        // else if (new URLSearchParams(location.search).get("signup"))
        //     setAssets(
        //         <Modal
        //             title="Sign Up"
        //         >
        //             <Signup ab={[assets, setAssets]} />
        //         </Modal>
        //     );
    }, []);

    return (
        <>
            {elements.map((e) => (
                <AlertsContext.Provider value={e} key={e.id}>
                    {e.content}
                </AlertsContext.Provider>
            ))}
        </>
    );
}