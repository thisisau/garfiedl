import { useAddAlert } from "../components/alerts/alert_hooks";
import Button from "../components/button";
import MainHeader from "../components/header";
import { Modal } from "../components/modal";

export default function TestStuff() {
  const addAlert = useAddAlert();

  return (
    <div id="page-container">
      <MainHeader />
      Page not foundddd
      <Button
        onClick={() => {

            let clearAlertF: () => void;
          addAlert(clearAlert => {
            clearAlertF=clearAlert;
            return <Modal title="Hi">I am a Modal #{Math.random().toString()}</Modal>
          }
          );
          setTimeout(()=>
            addAlert(
              <Modal title="Hi">I am a Modal #{Math.random().toString()}<Button onClick={clearAlertF}>Clear other alert</Button></Modal>
            ),1000

          )
        }}
      >
        Click me
      </Button>
    </div>
  );
}
