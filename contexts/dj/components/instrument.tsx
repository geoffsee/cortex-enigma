import React, {createContext, useContext, useEffect} from 'react';
import {useLocalObservable} from 'mobx-react-lite';

interface MeasurementState {
    unit: string;
    length: number;
    readonly lengthWithUnit: string;
}

const MeasurementContext = createContext<MeasurementState | null>(null);

export const useMeasurement = () => {
    const context = useContext(MeasurementContext);
    if (!context) {
        throw new Error('useMeasurement must be used within a MeasurementProvider');
    }
    return context;
};

export function MeasurementProvider({unit, children}: { unit: string; children: React.ReactNode }) {
    const state = useLocalObservable(() => ({
        unit, // the initial unit
        length: 0,
        get lengthWithUnit() {
            // lengthWithUnit can only depend on observables, hence the above conversion with `useAsObservableSource`
            return this.unit === "inch" ? `${this.length / 2.54} inch` : `${this.length} cm`
        }
    }))

    useEffect(() => {
        // sync the unit from 'props' into the observable 'state'
        state.unit = unit
    }, [unit])

    return (
        <MeasurementContext.Provider value={state}>
            {children}
        </MeasurementContext.Provider>
    );
}

function Measurement({unit}: { unit: string }) {
    const state = useMeasurement();

    return <h1>{state.lengthWithUnit}</h1>
}