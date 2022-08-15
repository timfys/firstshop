function feedDebugKey() {
    KeyPush({
        key: "debug_key",
        version: "1.3",
        user_name: "Debug User",
        level_type: 1
    });


    try {
        pSessionKey = KeyPop();
        if (pSessionKey == null)
            throw null;
        else {
            //console.info("key", pSessionKey);
        }
    } catch (err) {
        Logout();
    }
}