figma.showUI(__html__, { themeColors: true, width: 300, height: 664 });

figma.ui.onmessage = (msg) => {
    switch (msg.type) {
        case "MSG_TYPE":
            // Do something
            break;
    }
};
