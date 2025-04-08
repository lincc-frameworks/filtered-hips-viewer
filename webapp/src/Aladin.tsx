import React, {useEffect, useState} from 'react';
// @ts-ignore
import A from 'aladin-lite';

function Aladin({sliderIndex, setFov, catalog, setSelectedObj}: {
    sliderIndex: number,
    setFov: (fov: any, radec: any) => void,
    catalog: any[],
    setSelectedObj: (thing: any) => void,
}) {

    const [aladin, setAladin]: any = useState(null);
    const [cat, setCat]: any = useState(null);

    React.useEffect(() => {
        A.init.then(() => {
            let a = A.aladin('#aladin-lite-div', {
                fov: 360,
                projection: "SIN",
                cooFrame: 'equatorial',
                showCooGridControl: true,
                showCooGrid: true
            });
            setAladin(a)
            a.setImageSurvey(a.createImageSurvey("http://localhost:3000/gri/"));
            const c = A.catalog({name: "Rubin Objects", color: "red"});
            a.addCatalog(c);
            setCat(c);
            a.on('objectClicked', (object: any) => {
                if (object) {
                    setSelectedObj(object.data.catIndex);
                }
            });
        });
    }, []);

    const urls = [
        "http://localhost:3000/gri/",
        "http://localhost:3000/gri0/",
        "http://localhost:3000/gri0.1/",
        "http://localhost:3000/gri0.3/",
        "http://localhost:3000/gri0.7/",
        "http://localhost:3000/gri1.5/"
    ]

    const handleSliderUpdate = (value: number) => {
        console.log("Inner Component received new slider value:", value);
        if (aladin) {
            aladin.setImageSurvey(aladin.createImageSurvey(urls[value]));
        }
    };

    // Run the function whenever sliderValue changes
    useEffect(() => {
        handleSliderUpdate(sliderIndex);
    }, [sliderIndex]);

    useEffect(() => {
        console.log(cat);
        if (cat) {
            cat.removeAll();
            const sources = catalog.map((row, index) => {
                return A.source(row["i_ra"], row["i_dec"], {id: row["objectId"], catIndex: index})
            });
            cat.addSources(sources);
            setSelectedObj(-1);
        }
    }, [catalog]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (aladin) {
                setFov(aladin.getFov(), aladin.getRaDec()); // Call parent function every 500ms
            }
        }, 500);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [setFov]);

    return (
        <div id="aladin-lite-div" style={{width: "100%", height: "100%"}}/>
    );
}

export default Aladin;
