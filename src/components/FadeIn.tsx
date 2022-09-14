import { Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

type FadeInProps = {
  show: boolean;
  children: ReactNode;
};

export const FadeIn = ({ show = false, children }: FadeInProps) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-150"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
    show={show}
  >
    {children}
  </Transition>
);
